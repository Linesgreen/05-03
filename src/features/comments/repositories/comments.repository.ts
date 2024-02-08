import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
}
