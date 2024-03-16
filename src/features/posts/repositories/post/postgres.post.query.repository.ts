// noinspection ES6ShorthandObjectProperty

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../common/types/output';
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
              -- Создаем временную таблицу likes_info, где считаем количество лайков и дизлайков
              likes_info AS (
                  SELECT
                      COUNT(id) FILTER (WHERE "likeStatus" = 'Like') AS likesCount,
                      COUNT(id) FILTER (WHERE "likeStatus" = 'Dislike') AS dislikesCount
                  FROM public.post_likes
                  WHERE "postId" = $1
              ),
              -- Подготавливаем информацию о последних трех лайках к посту в JSON.
              newest_likes AS (
                  SELECT json_agg(json_build_object(
                          'addedAt', pl."createdAt",
                          'userId', pl."userId", 
                          'login', u.login 
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
          -- Основной запрос, который возвращает информацию о посте с  лайками.
          SELECT
              p.id, title, "shortDescription", content, p."blogId", p."createdAt", "name" as "blogName",
              json_build_object(
                      'likesCount', li.likesCount, -- Количество лайков
                      'dislikesCount', li.dislikesCount, -- Количество дизлайков
                      'myStatus', COALESCE(ul."likeStatus", 'None'), 
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

    if (!postWithBlogData[0]) return null;

    return postWithBlogData[0];
  }

  async getPosts(
    sortData: QueryPaginationResult,
    userId?: number,
    blogId?: number,
  ): Promise<PaginationWithItems<OutputPostType>> {
    const blogCondition = blogId ? `AND posts."blogId" = ${blogId}` : '';
    const posts: OutputPostType[] = await this.dataSource.query(
      `
          WITH filtered_posts AS (
              -- Выборка активных постов с применением сортировки и пагинации.
              SELECT
                  posts."id", posts."title", posts."shortDescription", posts."content",
                  posts."blogId", posts."createdAt", blogs."name" AS "blogName"
              FROM
                  public.posts posts
                      JOIN public.blogs blogs ON posts."blogId" = blogs."id"
              WHERE
                 posts."active" = true
                 ${blogCondition}
              ORDER BY
                  posts."${sortData.sortBy}" ${sortData.sortDirection}
              LIMIT
                  $1 -- Количество постов на страницу (pageSize).
                  OFFSET
                  $1 * ($2 - 1) -- Вычисление смещения на основе номера страницы (pageNumber).
          ), likes_counts AS (
              -- Агрегация количества лайков и дизлайков по каждому посту.
              SELECT
                  post_likes."postId",
                  COUNT(*) FILTER (WHERE post_likes."likeStatus" = 'Like') AS "likesCount",
                  COUNT(*) FILTER (WHERE post_likes."likeStatus" = 'Dislike') AS "dislikesCount"
              FROM
                  public.post_likes post_likes
              WHERE
                  post_likes."postId" IN (SELECT "id" FROM filtered_posts)
              GROUP BY
                  post_likes."postId"
          ), user_reaction AS (
              -- Определение реакции (лайк/дизлайк) текущего пользователя на посты.
              SELECT
                  post_likes."postId",
                  post_likes."likeStatus"
              FROM
                  public.post_likes post_likes
              WHERE
                  post_likes."userId" = $3 AND post_likes."postId" IN (SELECT "id" FROM filtered_posts)
          ), latest_likers AS (
              -- Выборка последних трех пользователей, поставивших лайк на каждый пост.
              SELECT
                  likes."postId",
                  json_agg(
                  json_build_object(
                          'addedAt', likes."createdAt",
                          'userId', CAST(likes."userId" AS VARCHAR),
                          'login', users."login"
                  ) ORDER BY likes."createdAt" DESC
                          ) FILTER (WHERE likes.rn <= 3) AS "newestLikes"
              FROM (
                       SELECT
                           post_likes."postId", post_likes."createdAt", post_likes."userId",
                           ROW_NUMBER() OVER (
                               PARTITION BY post_likes."postId"
                               ORDER BY post_likes."createdAt" DESC
                               ) AS rn
                       FROM
                           public.post_likes post_likes
                       WHERE
                           post_likes."likeStatus" = 'Like' AND
                           post_likes."postId" IN (SELECT "id" FROM filtered_posts)
                   ) likes
                       JOIN public.users users ON likes."userId" = users."id"
              WHERE
                  likes.rn <= 3
              GROUP BY
                  likes."postId"
          )
          -- Комбинирование данных из подзапросов для создания итоговой таблицы
          SELECT
              CAST(posts."id" AS VARCHAR) AS "id", -- Приводим id к строке
              posts."title",
              posts."shortDescription",
              posts."content",
              CAST(posts."blogId" AS VARCHAR) AS "blogId", -- Приводим blogId к строке
              posts."createdAt",
              posts."blogName",
              json_build_object(
                  'likesCount', COALESCE(likes_counts."likesCount", 0),
                  'dislikesCount', COALESCE(likes_counts."dislikesCount", 0),
                  'myStatus', COALESCE(user_reaction."likeStatus", 'None'),
                  'newestLikes', COALESCE(latest_likers."newestLikes", '[]'::json)
              ) AS "extendedLikesInfo"
          FROM
              filtered_posts posts
                  LEFT JOIN likes_counts ON posts."id" = likes_counts."postId"
                  LEFT JOIN user_reaction ON posts."id" = user_reaction."postId"
                  LEFT JOIN latest_likers ON posts."id" = latest_likers."postId"
          ORDER BY
              posts."${sortData.sortBy}" ${sortData.sortDirection};
      `,
      [sortData.pageSize, sortData.pageNumber, userId],
    );

    const allDtoPosts: OutputPostType[] = posts;

    const totalCountCondition = blogId ? `AND p."blogId" = ${blogId}` : '';
    const totalCount = await this.dataSource.query(`
        SELECT COUNT(p.id)
        FROM public.posts p
        WHERE   p."active" = true
        ${totalCountCondition}
    `);

    return new PaginationWithItems(+sortData.pageNumber, +sortData.pageSize, Number(totalCount[0].count), allDtoPosts);
  }
}
