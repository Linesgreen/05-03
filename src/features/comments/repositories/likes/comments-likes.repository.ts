import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { PostLikeWithLoginFromDb } from '../../../posts/entites/like';
import { createCommentLike } from '../../entites/comment-like';
import { LikeStatusType } from '../../types/comments/input';

@Injectable()
export class CommentsLikesRepository extends AbstractRepository<PostLikeWithLoginFromDb> {
  private CommentLieksModel: any;
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async createLike(
    // commentId: string,
    // postId: string,
    // userId: string,
    // login: string,
    // likeStatus: LikeStatusType,
    newLike: createCommentLike,
  ): Promise<void> {
    const { userId, likeStatus, commentId, createdAt, postId } = newLike;
    const tableName = 'comments_likes';
    const entity = { userId, likeStatus, commentId, createdAt, postId };
    await this.add(tableName, entity);
  }

  async updateLikeStatus(commentId: number, userId: number, likeStatus: LikeStatusType): Promise<void> {
    const tableName = 'comments_likes';
    await this.updateFieldsOnMultySearch(tableName, { commentId, userId }, { likeStatus });
  }
}
