import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../infrastructure/repositories/abstract.repository';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../common/types/output';
import { BlogPG } from '../entites/blogPG';
import { BlogPgDb, OutputBlogType } from '../types/output';

@Injectable()
export class PostgresBlogsQueryRepository extends AbstractRepository<BlogPgDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async getBlogById(blogId: number): Promise<OutputBlogType | null> {
    const tableName = 'blogs';
    const fields = ['id', 'name', 'description', 'websiteUrl', 'createdAt', 'isMembership'];
    const blog = await this.getByFields(tableName, fields, { id: blogId, active: true });
    if (!blog) return null;
    return BlogPG.fromDbToInstance(blog[0]).toDto();
  }

  async getAll(sortData: QueryPaginationResult): Promise<PaginationWithItems<OutputBlogType>> {
    const serachLoginTerm = sortData.searchLoginTerm ?? '';

    const blogs = await this.dataSource.query(
      `SELECT id,"name","description", "websiteUrl", "createdAt", "isMembership"
       FROM public.blogs
       WHERE (name ILIKE '%${serachLoginTerm}%') AND "active" = true
       ORDER BY "${sortData.sortBy}" ${sortData.sortDirection}
       LIMIT ${sortData.pageSize} OFFSET ${(sortData.pageNumber - 1) * sortData.pageSize}
      `,
    );

    const allDtoBlogs: OutputBlogType[] = blogs.map((blog) => BlogPG.fromDbToInstance(blog).toDto());
    const totalCount = await this.dataSource.query(`
      SELECT COUNT(id) FROM public.blogs WHERE  (name ILIKE '%${serachLoginTerm}%') AND "active" = true
    `);

    return new PaginationWithItems(+sortData.pageNumber, +sortData.pageSize, Number(totalCount[0].count), allDtoBlogs);
  }
}
