// noinspection ES6ShorthandObjectProperty

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../common/types/output';
import { LikesInfo } from '../../entites/post';
import { OutputPostType, PostPgWithBlogDataDb } from '../../types/output';

@Injectable()
export class PostgresPostQueryRepository extends AbstractRepository<PostPgWithBlogDataDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  /**
   * Получает информацию о посте по его идентификатору с дополнительной информацией о лайках.
   * Если `userId` не передан, статус лайка будет 'None' по умолчанию.
   * @param postId - Идентификатор поста.
   * @param userId - (Опционально) Идентификатор пользователя для проверки статуса лайка.
   * @returns Запись с информацией о посте и лайках или null, если пост не найден.
   */
  async getPostById(postId: number, userId?: number): Promise<OutputPostType | null> {
    const postWithBlogData: OutputPostType[] = await this.dataSource.query(
      `
          WITH
              -- Сначала формируем временную таблицу user_likes с информацией о статусе лайка конкретного пользователя для данного поста.
              user_likes AS (
                  SELECT "likeStatus"
                  FROM public.post_likes
                  WHERE "postId" = $1 AND "userId" = COALESCE($2, 0) -- Если userId не задан, используем 0 как недопустимое значение
              ),
              -- Создаем временную таблицу likes_info, где агрегируем количество лайков и дизлайков для поста.
              likes_info AS (
                  SELECT
                      COUNT(id) FILTER (WHERE "likeStatus" = 'Like') AS likesCount, -- Подсчет количества лайков
                      COUNT(id) FILTER (WHERE "likeStatus" = 'Dislike') AS dislikesCount -- Подсчет количества дизлайков
                  FROM public.post_likes
                  WHERE "postId" = $1
              ),
              -- Подготавливаем информацию о последних трех лайках к посту в формате JSON.
              newest_likes AS (
                  SELECT json_agg(json_build_object(
                          'addedAt', pl."createdAt", -- Время добавления лайка
                          'userId', pl."userId", -- ID пользователя, который поставил лайк
                          'login', u.login -- Логин пользователя
                                  )) AS latest_likes
                  FROM (
                           SELECT pl."createdAt", pl."userId"
                           FROM public.post_likes pl
                           WHERE pl."postId" = $1
                           ORDER BY pl."createdAt" DESC -- Сортируем лайки по дате добавления
                           LIMIT 3 -- Ограничиваем количество лайков тремя
                       ) pl
                           JOIN public.users u ON pl."userId" = u.id -- Соединяем с таблицей пользователей для получения логинов
              )
          -- Основной запрос, который возвращает информацию о посте с расширенной информацией о лайках.
          SELECT
              p.id, title, "shortDescription", content, p."blogId", p."createdAt", "name" as "blogName",
              json_build_object(
                      'likesCount', li.likesCount, -- Количество лайков
                      'dislikesCount', li.dislikesCount, -- Количество дизлайков
                      'myStatus', COALESCE(ul."likeStatus", 'None'), -- Статус лайка текущего пользователя, 'None', если пользователь не указан
                      'newestLikes', nl.latest_likes -- Информация о последних трех лайках
              ) as "extendedLikesInfo"
          FROM public.posts p
                   JOIN public.blogs b ON p."blogId" = b."id" -- Соединение с таблицей блогов для получения имени блога
                   CROSS JOIN likes_info li -- Добавляем информацию о лайках и дизлайках
                   CROSS JOIN newest_likes nl -- Добавляем информацию о последних лайках
                   LEFT JOIN user_likes ul ON true -- LEFT JOIN позволяет сохранить строки даже если совпадений в user_likes не найдено
          WHERE p.id = $1 AND p."active" = true
        `,
      [postId, userId],
    );

    // Если пост не найден, возвращаем null
    if (!postWithBlogData[0]) return null;

    // Возвращаем информацию о найденном посте
    return postWithBlogData[0];
  }

  async getPostForBlog(
    blogId: number,
    sortData: QueryPaginationResult,
    userId?: number,
  ): Promise<PaginationWithItems<OutputPostType>> {
    const offset = (sortData.pageNumber - 1) * sortData.pageSize;

    const posts: OutputPostType[] = await this.dataSource.query(
      `
          WITH relevant_posts AS (
              -- Выборка активных постов из указанного блога.
              SELECT p."id"
              FROM public.posts p
              WHERE p."blogId" = $1 AND p."active" = true
          ),
               -- Шаг 2: Получение информации о количестве лайков и дизлайков для каждого поста.
               likes_info AS (
                   SELECT
                       pl."postId",
                       COUNT(id) FILTER (WHERE pl."likeStatus" = 'Like') AS likesCount,
                       COUNT(id) FILTER (WHERE pl."likeStatus" = 'Dislike') AS dislikesCount
                   FROM public.post_likes pl
                   -- Фильтрация постов только по тем, что были ранее выбраны в relevant_posts
                   WHERE pl."postId" IN (SELECT "id" FROM relevant_posts)
                   GROUP BY pl."postId"
               ),
               -- Шаг 3: Определение статуса лайка текущего пользователя для каждого поста.
               user_like_status AS (
                   SELECT
                       pl."postId",
                       pl."likeStatus"
                   FROM public.post_likes pl
                   -- Фильтрация лайков только по тем, что были ранее выбраны в relevant_posts.
                   WHERE pl."userId" = $3 AND pl."postId" IN (SELECT "id" FROM relevant_posts)
               ),
               -- Шаг 4: Получение информации о трех последних лайках для каждого поста.
               latest_likes AS (
                   SELECT
                       sub."postId",
                       -- Агрегирование JSON объектов для каждого поста с последними лайками.
                       json_agg(
                       -- Построение JSON объекта для каждого лайка
                       json_build_object(
                               'addedAt', sub."createdAt",
                               'userId', sub."userId",
                               'login', sub."login"
                       ) ORDER BY sub."createdAt" DESC
                               -- Фильтрация для ограничения до трех последних лайков
                               ) FILTER (WHERE sub.rn <= 3) AS latestLikes
                   FROM (
                            -- Подзапрос для получения лайков, объединенного с информацией о пользователях.
                            SELECT
                                pl."postId",
                                pl."createdAt",
                                pl."userId",
                                u."login",
                                -- Нумерация строк по времени добавления для каждого поста
                                ROW_NUMBER() OVER (
                                    PARTITION BY pl."postId" ORDER BY pl."createdAt" DESC
                                    ) AS rn
                            FROM public.post_likes pl
                                     INNER JOIN public.users u ON pl."userId" = u."id"
                            -- Фильтрация лайков только по тем, что были ранее выбраны в relevant_posts.
                            WHERE pl."likeStatus" = 'Like' AND pl."postId" IN (SELECT "id" FROM relevant_posts)
                        ) AS sub -- Использование алиаса sub для подзапроса
                   WHERE sub.rn <= 3  -- Фильтрация для ограничения до трех последних лайков
                   GROUP BY sub."postId"
               )
          -- Основной запрос: Получение информации о постах с учетом лайков.
          SELECT
              p."id",
              p."title",
              p."shortDescription",
              p."content",
              p."blogId",
              p."createdAt",
              b."name" AS "blogName",
              -- Обработка NULL значений с использованием COALESCE.
              COALESCE(li.likesCount, 0) AS likesCount,
              COALESCE(li.dislikesCount, 0) AS dislikesCount,
              COALESCE(uls."likeStatus", 'None') AS myStatus,
              COALESCE(ll.latestLikes, '[]'::json) AS latestLikes
          FROM relevant_posts rp
                   -- Объединение таблиц для получения информации о постах.
                   INNER JOIN public.posts p ON rp."id" = p."id"
                   INNER JOIN public.blogs b ON p."blogId" = b."id"
                   LEFT JOIN likes_info li ON p."id" = li."postId"
                   LEFT JOIN user_like_status uls ON p."id" = uls."postId"
                   LEFT JOIN latest_likes ll ON p."id" = ll."postId"
          ORDER BY p."${sortData.sortBy}" ${sortData.sortDirection}
          LIMIT $2 OFFSET $4;


      `,
      [blogId, sortData.pageSize, userId, offset],
    );

    const allDtoPosts: OutputPostType[] = posts;

    const totalCount = await this.dataSource.query(`
      SELECT COUNT(p.id) 
      FROM public.posts p
      WHERE   p."active" = true AND p."blogId" = ${blogId}
    `);

    return new PaginationWithItems(+sortData.pageNumber, +sortData.pageSize, Number(totalCount[0].count), allDtoPosts);
  }
  async getPosts(sortData: QueryPaginationResult, userId?: number): Promise<PaginationWithItems<OutputPostType>> {
    const offset = (sortData.pageNumber - 1) * sortData.pageSize;

    const posts: OutputPostType[] = await this.dataSource.query(
      `
          WITH relevant_posts AS (
              -- Выборка активных постов из указанного блога.
              SELECT p."id"
              FROM public.posts p
              WHERE  p."active" = true
          ),
               -- Шаг 2: Получение информации о количестве лайков и дизлайков для каждого поста.
               likes_info AS (
                   SELECT
                       pl."postId",
                       COUNT(id) FILTER (WHERE pl."likeStatus" = 'Like') AS likesCount,
                       COUNT(id) FILTER (WHERE pl."likeStatus" = 'Dislike') AS dislikesCount
                   FROM public.post_likes pl
                   -- Фильтрация постов только по тем, что были ранее выбраны в relevant_posts
                   WHERE pl."postId" IN (SELECT "id" FROM relevant_posts)
                   GROUP BY pl."postId"
               ),
               -- Шаг 3: Определение статуса лайка текущего пользователя для каждого поста.
               user_like_status AS (
                   SELECT
                       pl."postId",
                       pl."likeStatus"
                   FROM public.post_likes pl
                   -- Фильтрация лайков только по тем, что были ранее выбраны в relevant_posts.
                   WHERE pl."userId" = $2 AND pl."postId" IN (SELECT "id" FROM relevant_posts)
               ),
               -- Шаг 4: Получение информации о трех последних лайках для каждого поста.
               latest_likes AS (
                   SELECT
                       sub."postId",
                       -- Агрегирование JSON объектов для каждого поста с последними лайками.
                       json_agg(
                           -- Построение JSON объекта для каждого лайка
                       json_build_object(
                               'addedAt', sub."createdAt",
                               'userId', sub."userId",
                               'login', sub."login"
                       ) ORDER BY sub."createdAt" DESC
                           -- Фильтрация для ограничения до трех последних лайков
                               ) FILTER (WHERE sub.rn <= 3) AS latestLikes
                   FROM (
                            -- Подзапрос для получения лайков, объединенного с информацией о пользователях.
                            SELECT
                                pl."postId",
                                pl."createdAt",
                                pl."userId",
                                u."login",
                                -- Нумерация строк по времени добавления для каждого поста
                                ROW_NUMBER() OVER (
                                    PARTITION BY pl."postId" ORDER BY pl."createdAt" DESC
                                    ) AS rn
                            FROM public.post_likes pl
                                     INNER JOIN public.users u ON pl."userId" = u."id"
                            -- Фильтрация лайков только по тем, что были ранее выбраны в relevant_posts.
                            WHERE pl."likeStatus" = 'Like' AND pl."postId" IN (SELECT "id" FROM relevant_posts)
                        ) AS sub -- Использование алиаса sub для подзапроса
                   WHERE sub.rn <= 3  -- Фильтрация для ограничения до трех последних лайков
                   GROUP BY sub."postId"
               )
          -- Основной запрос: Получение информации о постах с учетом лайков.
          SELECT
              p."id",
              p."title",
              p."shortDescription",
              p."content",
              p."blogId",
              p."createdAt",
              b."name" AS "blogName",
              -- Обработка NULL значений с использованием COALESCE.
              COALESCE(li.likesCount, 0) AS likesCount,
              COALESCE(li.dislikesCount, 0) AS dislikesCount,
              COALESCE(uls."likeStatus", 'None') AS myStatus,
              COALESCE(ll.latestLikes, '[]'::json) AS latestLikes
          FROM relevant_posts rp
                   -- Объединение таблиц для получения информации о постах.
                   INNER JOIN public.posts p ON rp."id" = p."id"
                   INNER JOIN public.blogs b ON p."blogId" = b."id"
                   LEFT JOIN likes_info li ON p."id" = li."postId"
                   LEFT JOIN user_like_status uls ON p."id" = uls."postId"
                   LEFT JOIN latest_likes ll ON p."id" = ll."postId"
          ORDER BY p."${sortData.sortBy}" ${sortData.sortDirection}
          LIMIT $1 OFFSET $3;


      `,
      [sortData.pageSize, userId, offset],
    );

    const allDtoPosts: OutputPostType[] = posts;

    const totalCount = await this.dataSource.query(`
        SELECT COUNT(p.id)
        FROM public.posts p
        WHERE   p."active" = true
    `);

    return new PaginationWithItems(+sortData.pageNumber, +sortData.pageSize, Number(totalCount[0].count), allDtoPosts);
  }

  private postMap(post: PostPgWithBlogDataDb, likesInfo: LikesInfo): OutputPostType {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: likesInfo.likesCount,
        dislikesCount: likesInfo.dislikesCount,
        myStatus: likesInfo.myStatus,
        newestLikes: likesInfo.newestLikes,
      },
    };
  }
}
