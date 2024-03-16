import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { PostLikeWithLoginFromDb } from '../../../posts/entites/like';
import { CommentLike } from '../../entites/comment-like';

@Injectable()
export class CommentsLikesQueryRepository extends AbstractRepository<PostLikeWithLoginFromDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async getLikeByUserId(commentId: number, userId: number): Promise<CommentLike | null> {
    const tableName = 'comments_likes';
    const fieldsToSelect = ['likeStatus', 'createdAt', 'commentId', 'postId', 'userId', 'id'];
    const like = await this.getByFields(tableName, fieldsToSelect, { commentId, userId });
    return like ? like[0] : null;
  }
}
