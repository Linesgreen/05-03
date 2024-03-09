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
            -- Получаем статус лайка данного пользователя к посту
            SELECT "likeStatus"
            FROM public.post_likes
            WHERE "postId" = $1 AND "userId" = $2
        )
        SELECT
            p.id, title, "shortDescription", content, p."blogId", p."createdAt", "name" as "blogName",
            -- Формируем объект с информацией о лайках
            json_build_object(
                'likesCount', (SELECT COUNT(id) FROM public.post_likes WHERE "postId" = $1 AND "likeStatus" = 'Like'),
                'dislikesCount', (SELECT COUNT(id) FROM public.post_likes WHERE "postId" = $1 AND "likeStatus" = 'Dislike'),
                -- Если userId не указан, статус лайка будет 'None'
                'myStatus', ${userId ? `(SELECT "likeStatus" FROM user_likes)` : `'None'`} 
                'newestLikes', (
                    -- Получаем информацию о последних лайках к посту
                    SELECT json_agg(json_build_object(
                        'addedAt', pl."createdAt",
                        'userId', pl."userId",
                        'login', u.login
                    ))
                    FROM (
                        SELECT pl."createdAt", pl."userId"
                        FROM public.post_likes pl
                        WHERE pl."postId" = $1
                        ORDER BY pl."createdAt" DESC
                        LIMIT 3
                    ) pl
                    JOIN public.users u ON pl."userId" = u.id
                )
            ) as "extendedLikesInfo"
        FROM public.posts p
        JOIN public.blogs b on p."blogId" = b."id"
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
