import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LikeStatusType } from '../../types/comments/input';
import { Comment, CommentsDocument } from './comment.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: Model<CommentsDocument>,
  ) {}

  async addComment(newComment: Comment): Promise<CommentsDocument> {
    const newCommentToDB = new this.CommentModel(newComment);
    await this.saveComment(newCommentToDB);
    return newCommentToDB;
  }

  async deleteUserById(commentId: string): Promise<boolean> {
    const deleteResult = await this.CommentModel.findByIdAndDelete(commentId);
    return !!deleteResult;
  }

  async getCommentById(commentId: string): Promise<CommentsDocument | null> {
    return this.CommentModel.findById(commentId);
  }

  async saveComment(comment: CommentsDocument): Promise<void> {
    await comment.save();
  }
  //TODO узнать нормально ли или лучше как было раньше?
  async updateLikesCount(
    commentId: string,
    operation: 'increment' | 'decrement',
    likeStatus: LikeStatusType,
  ): Promise<void> {
    const updateField = likeStatus === 'Like' ? 'likesCount' : 'dislikesCount';
    const updateValue = operation === 'increment' ? 1 : -1;

    // Если нужно обновить оба поля (switch), вызовите эту функцию дважды с разными полями
    await this.CommentModel.findByIdAndUpdate(commentId, { $inc: { [updateField]: updateValue } }, { new: true });
  }
}
