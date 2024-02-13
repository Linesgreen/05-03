import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Blog } from '../../../blogs/repositories/blogs-schema';
import { PaginationWithItems } from '../../../common/types/output';
import { QueryPagination } from '../../../common/utils/queryPagination';
import { PostSortData } from '../../../posts/types/input';
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
  async getCommentsByPostId(queryData: PostSortData, postId: string): Promise<PaginationWithItems<CommentsDocument>> {
    const formattedSortData = QueryPagination.convertQueryPination(queryData);

    const filter: FilterQuery<Blog> = { postId };
    const sortFilter: FilterQuery<Blog> = { [formattedSortData.sortBy]: formattedSortData.sortDirection };
    const comments = await this.CommentModel.find(filter)
      .sort(sortFilter)
      .skip((+formattedSortData.pageNumber - 1) * +formattedSortData.pageSize)
      .limit(+formattedSortData.pageSize);

    const totalCount: number = await this.CommentModel.countDocuments(filter);

    return new PaginationWithItems(+formattedSortData.pageNumber, +formattedSortData.pageSize, totalCount, comments);
  }

  async saveComment(comment: CommentsDocument): Promise<void> {
    await comment.save();
  }
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
