import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommentLikes, CommentsLikesDocument } from './likes.schema';

//TODO куда положить интерфейс
export interface ICommentsLikesQueryRepository {
  getLikeByUserId(commentId: string, userId: string): Promise<CommentsLikesDocument | null>;
  getManyLikesByUserId(ids: string[], userId: string): Promise<CommentsLikesDocument[]>;
}

@Injectable()
export class CommentsLikesQueryRepository implements ICommentsLikesQueryRepository {
  constructor(
    @InjectModel(CommentLikes.name)
    private CommentLieksModel: Model<CommentsLikesDocument>,
  ) {}

  async getLikeByUserId(commentId: string, userId: string): Promise<CommentsLikesDocument | null> {
    return this.CommentLieksModel.findOne({ commentId, userId });
  }

  async getManyLikesByUserId(ids: string[], userId: string): Promise<CommentsLikesDocument[]> {
    return this.CommentLieksModel.find({
      commentId: { $in: ids },
      userId,
    });
  }
}
