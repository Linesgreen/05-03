/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { BlogPG } from '../../../blogs/entites/blogPG';
import { BlogPgDb } from '../../../blogs/types/output';
import { CommentToPgDB } from '../../entites/commentPG';

//TODO узнать
@Injectable()
export class PostgresCommentsRepository extends AbstractRepository<BlogPgDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  //TODO узнать про то что возвращается комментарий
  async addComment(newComment: CommentToPgDB): Promise<number> {
    const { userId, postId, content, createdAt } = newComment;
    const entity = { userId, postId, content, createdAt };
    const commentInDb = await this.add('comments', entity);
    return commentInDb[0].id;
  }

  async getBlogById(blogId: number): Promise<BlogPG | null> {
    const tableName = 'blogs';
    const fields = ['id', 'name', 'description', 'websiteUrl', 'createdAt', 'isMembership'];
    const blog = await this.getByFields(tableName, fields, { id: blogId, active: true });
    if (!blog) return null;
    return BlogPG.fromDbToInstance(blog[0]);
  }
  /**
   * Проверяет существование пользователя по логину или email
   * @param loginOrEmail - Логин или email пользователя
   * @returns true, если пользователь существует, иначе false
   */
  async chekUserIsExistByLoginOrEmail(loginOrEmail: string): Promise<boolean> {
    const chekResult = await this.dataSource.query(
      `SELECT EXISTS(SELECT id FROM public.users
                     WHERE (email = $1 OR login = $1) AND active = true) as exists`,
      [loginOrEmail],
    );
    return chekResult[0].exists;
  }
  /**
   * Проверяет существование пользователя по логину или email
   * @returns true, если пользователь существует, иначе false
   * @param blogId
   */
  async chekBlogIsExist(blogId: number): Promise<boolean> {
    const tableName = 'blogs';
    return this.checkIfExistsByFields(tableName, { id: blogId, active: true });
  }

  /**
   * Обновляет поля для блога
   * @returns Promise<void>
   * @param blogId
   * @param blogUpdateData { name: string; description: string; websiteUrl: string }
   */
  async updateBlog(
    blogId: number,
    blogUpdateData: { name: string; description: string; websiteUrl: string },
  ): Promise<void> {
    const tableName = 'blogs';
    // Call the parent class method
    await this.updateFields(tableName, 'id', blogId, blogUpdateData);
  }
  async deleteById(id: number): Promise<void> {
    const tableName = 'blogs';
    await this.updateFields(tableName, 'id', id, { active: false });
  }
}
