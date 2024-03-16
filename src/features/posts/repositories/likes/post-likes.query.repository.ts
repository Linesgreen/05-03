import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { PostLike, PostLikeWithLoginFromDb } from '../../entites/like';

@Injectable()
export class PostLikesQueryRepository extends AbstractRepository<PostLikeWithLoginFromDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async getLikeByUserId(postId: number, userId: number): Promise<PostLike | null> {
    const tableName = 'post_likes';
    const fieldsToSelect = ['likeStatus', 'createdAt', 'postId', 'blogId', 'userId', 'id'];
    const like = await this.getByFields(tableName, fieldsToSelect, { postId, userId });
    return like ? like[0] : null;
  }
}
