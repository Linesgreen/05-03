/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { PostPg } from '../../entites/post';
import { PostPgDb } from '../../types/output';

//TODO узнать
@Injectable()
export class PostgresPostRepository extends AbstractRepository<PostPgDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async addPost(newPost: PostPg): Promise<string> {
    const { title, shortDescription, content, blogId, createdAt } = newPost;
    const entity = {
      title,
      shortDescription,
      content,
      blogId,
      createdAt,
    };
    const postInDB = await this.add('posts', entity);
    const postId = postInDB[0].id;
    return postId;
  }
  async deleteById(id: number): Promise<void> {
    const tableName = 'posts';
    await this.updateFields(tableName, 'id', id, { active: false });
  }
  async chekPostIsExist(id: number): Promise<boolean> {
    const tableName = 'posts';
    return this.checkIfExistsByFields(tableName, { id: id, active: true });
  }
  async updatePost(
    postId: number,
    postUpdateData: { title: string; shortDescription: string; content: string },
  ): Promise<void> {
    const tableName = 'posts';
    await this.updateFields(tableName, 'id', postId, postUpdateData);
  }
}
