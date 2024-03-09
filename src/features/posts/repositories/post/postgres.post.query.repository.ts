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
          WITH user_likes AS (
              SELECT "likeStatus"
              FROM public.post_likes
              WHERE "postId" = $1 AND "userId" = COALESCE($2, 0) -- Используем 0 или другое недопустимое значение для userId, если он не задан
          ),
               likes_info AS (
                   SELECT
                       COUNT(id) FILTER (WHERE "likeStatus" = 'Like') AS likesCount,
                       COUNT(id) FILTER (WHERE "likeStatus" = 'Dislike') AS dislikesCount
                   FROM public.post_likes
                   WHERE "postId" = $1
               ),
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
                            ORDER BY pl."createdAt" DESC
                            LIMIT 3
                        ) pl
                            JOIN public.users u ON pl."userId" = u.id
               )
          SELECT
              p.id, title, "shortDescription", content, p."blogId", p."createdAt", "name" as "blogName",
              json_build_object(
                      'likesCount', li.likesCount,
                      'dislikesCount', li.dislikesCount,
                      'myStatus', COALESCE(ul."likeStatus", 'None'),
                      'newestLikes', nl.latest_likes
              ) as "extendedLikesInfo"
          FROM public.posts p
                   JOIN public.blogs b ON p."blogId" = b."id"
                   CROSS JOIN likes_info li
                   CROSS JOIN newest_likes nl
                   LEFT JOIN user_likes ul ON true
          WHERE p.id = $1 AND p."active" = true

      `,
      [postId, userId],
    );

    // Если пост не найден, возвращаем null
    if (!postWithBlogData[0]) return null;

    // Возвращаем информацию о найденном посте
    return postWithBlogData[0];
  }

  async getPostForBlog(blogId: number, sortData: QueryPaginationResult): Promise<PaginationWithItems<OutputPostType>> {
    const posts: PostPgWithBlogDataDb[] = await this.dataSource.query(
      `SELECT  p.id, title, "shortDescription", content, p."blogId", p."createdAt", "name" as "blogName"
       FROM public.posts p
       JOIN public.blogs b on p."blogId" = b."id"
       WHERE   p."active" = true AND p."blogId" = ${blogId}
       ORDER BY "${sortData.sortBy}" ${sortData.sortDirection}
       LIMIT ${sortData.pageSize} OFFSET ${(sortData.pageNumber - 1) * sortData.pageSize}
      `,
    );
    const allDtoPosts: OutputPostType[] = posts.map((post) =>
      this.postMap(post, { likesCount: 0, dislikesCount: 0, myStatus: 'None', newestLikes: [] }),
    );
    const totalCount = await this.dataSource.query(`
      SELECT COUNT(p.id) 
      FROM public.posts p
      WHERE   p."active" = true AND p."blogId" = ${blogId}
    `);

    return new PaginationWithItems(+sortData.pageNumber, +sortData.pageSize, Number(totalCount[0].count), allDtoPosts);
  }
  async getPosts(sortData: QueryPaginationResult): Promise<PaginationWithItems<OutputPostType>> {
    const posts: PostPgWithBlogDataDb[] = await this.dataSource.query(
      `SELECT  p.id, title, "shortDescription", content, p."blogId", p."createdAt", "name" as "blogName"
       FROM public.posts p
       JOIN public.blogs b on p."blogId" = b."id"
       WHERE   p."active" = true 
       ORDER BY "${sortData.sortBy}" ${sortData.sortDirection}
       LIMIT ${sortData.pageSize} OFFSET ${(sortData.pageNumber - 1) * sortData.pageSize}
      `,
    );
    const allDtoPosts: OutputPostType[] = posts.map((post) =>
      this.postMap(post, { likesCount: 0, dislikesCount: 0, myStatus: 'None', newestLikes: [] }),
    );
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
