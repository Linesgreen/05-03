import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { LikeStatusType } from '../../../comments/types/comments/input';
import { createPostLike, PostLikeFromDb } from '../../entites/like';

@Injectable()
export class PostLikesRepository extends AbstractRepository<PostLikeFromDb> {
  private PostLikesModel: any;
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async createLike(newLike: createPostLike): Promise<void> {
    const { postId, blogId, userId, likeStatus, createdAt } = newLike;
    const tableName = 'post_likes';
    const entity = { postId, blogId, userId, likeStatus, createdAt };
    await this.add(tableName, entity);
  }

  async updateLikeStatus(postId: number, userId: number, likeStatus: LikeStatusType): Promise<void> {
    const tableName = 'post_likes';
    await this.updateFieldsOnMultySearch(tableName, { postId, userId }, { likeStatus });
  }
}
