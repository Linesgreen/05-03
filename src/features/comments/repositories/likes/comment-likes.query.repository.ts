import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommentsLikes, CommentsLikesDocument } from './likes.schema';

@Injectable()
export class CommentLikesQueryRepository {
  constructor(
    @InjectModel(CommentsLikes.name)
    private CommentLieksModel: Model<CommentsLikesDocument>,
  ) {}

  async getLikeByUserId(commentId: string, userId: string): Promise<CommentsLikesDocument | null> {
    return this.CommentLieksModel.findOne({ commentId, userId });
  }

  async saveComment(comment: CommentsLikesDocument): Promise<void> {
    await comment.save();
  }
}
