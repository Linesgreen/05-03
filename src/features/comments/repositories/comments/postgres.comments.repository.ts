/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { BlogPgDb } from '../../../blogs/types/output';
import { CommentToPgDB } from '../../entites/commentPG';

@Injectable()
export class PostgresCommentsRepository extends AbstractRepository<BlogPgDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async addComment(newComment: CommentToPgDB): Promise<number> {
    const { userId, postId, content, createdAt } = newComment;
    const entity = { userId, postId, content, createdAt };
    const commentInDb = await this.add('comments', entity);
    return commentInDb[0].id;
  }
  async chekIsExist(id: number): Promise<boolean> {
    const tableName = 'comments';
    return this.checkIfExistsByFields(tableName, { id: id, active: true });
  }

  /**
   * Обновляет поля для блога
   * @returns Promise<void>
   * @param commentId
   * @param content
   */
  async updateComment(commentId: number, content: string): Promise<void> {
    const tableName = 'comments';
    await this.updateFields(tableName, 'id', commentId, { content: content });
  }
  async deleteById(id: number): Promise<void> {
    const tableName = 'comments';
    await this.updateFields(tableName, 'id', id, { active: false });
  }
}
