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

  async getPostById(postId: number): Promise<OutputPostType | null> {
    const postWithBlogData: PostPgWithBlogDataDb[] = await this.dataSource.query(
      `
      SELECT  p.id, title, "shortDescription", content, p."blogId", p."createdAt", "name" as "blogName"
      FROM public.posts p
      JOIN public.blogs b on p."blogId" = b."id"
          WHERE p.id = ${postId} AND p."active" = true 
      `,
    );
    if (!postWithBlogData[0]) return null;
    return this.postMap(postWithBlogData[0], { likesCount: 0, dislikesCount: 0, myStatus: 'None', newestLikes: [] });
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
