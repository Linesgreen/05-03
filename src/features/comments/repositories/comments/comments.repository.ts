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
  //TODO засунуть в метод класса Comments
  async addLikes(commentId: string, likeStatus: LikeStatusType): Promise<void> {
    const targetComment = await this.CommentModel.findById(commentId);

    switch (likeStatus) {
      case 'Dislike':
        targetComment!.dislikesCount = targetComment!.dislikesCount + 1;
        break;
      case 'Like':
        targetComment!.likesCount = targetComment!.likesCount + 1;
        break;
    }
    await targetComment!.save();
  }
  async decreaseLike(commentId: string, likeStatus: LikeStatusType): Promise<void> {
    const targetComment = await this.CommentModel.findById(commentId);
    switch (likeStatus) {
      case 'Dislike':
        targetComment!.dislikesCount = targetComment!.dislikesCount - 1;
        break;
      case 'Like':
        targetComment!.likesCount = targetComment!.likesCount - 1;
        break;
    }
    await targetComment!.save();
  }
  async switchLike(commentId: string, likeStatus: LikeStatusType): Promise<void> {
    const targetComment = await this.CommentModel.findById(commentId);

    switch (likeStatus) {
      case 'Dislike':
        targetComment!.dislikesCount++;
        targetComment!.likesCount--;
        break;
      case 'Like':
        targetComment!.likesCount++;
        targetComment!.dislikesCount--;
        break;
    }

    await targetComment!.save();
  }
}
