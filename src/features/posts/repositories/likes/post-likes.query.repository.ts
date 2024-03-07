import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { PostLikeFromDb } from '../../entites/like';
import { NewestLikeType } from '../../entites/post';
import { PostLikesDocument } from './post-likes.schema';

@Injectable()
export class PostLikesQueryRepository extends AbstractRepository<PostLikeFromDb> {
  private PostLikesModel: any;
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async getLikeByUserId(postId: number, userId: number): Promise<PostLikeFromDb | null> {
    const tableName = 'post_likes';
    const fieldsToSelect = ['likeStatus', 'createdAt', 'postId', 'blogId', 'userId', 'id'];
    const like = await this.getByFields(tableName, fieldsToSelect, { postId, userId });
    return like ? like[0] : null;
  }

  async getManyLikesByUserId(ids: string[], userId: string): Promise<PostLikesDocument[]> {
    return this.PostLikesModel.find({
      postId: { $in: ids },
      userId,
    });
  }
  async getLastThreeLikes(postId: string): Promise<NewestLikeType[]> {
    const targetLikes: PostLikesDocument[] | null = await this.PostLikesModel.find({
      postId: postId,
      likeStatus: 'Like',
    })
      .sort({ createdAt: -1 })
      .limit(3);
    return (targetLikes?.map((like) => like.toDto()) ?? null) as NewestLikeType[];
  }
}
