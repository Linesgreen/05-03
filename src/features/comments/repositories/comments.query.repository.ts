import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Blog } from '../../blogs/repositories/blogs-schema';
import { PaginationWithItems } from '../../common/types/output';
import { QueryPagination } from '../../common/utils/queryPagination';
import { PostSortData } from '../../posts/types/input';
import { OutputCommentType } from '../types/output';
import { Comment, CommentsDocument } from './comment.schema';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: Model<CommentsDocument>,
  ) {}

  async getCommentById(commentId: string): Promise<OutputCommentType | null> {
    const targetComment: CommentsDocument | null = await this.CommentModel.findById(commentId);
    return targetComment?.toDto() ?? null;
  }

  async getCommentsByPostId(queryData: PostSortData, postId: string): Promise<PaginationWithItems<OutputCommentType>> {
    const formattedSortData = QueryPagination.convertQueryPination(queryData);

    const filter: FilterQuery<Blog> = { postId };
    const sortFilter: FilterQuery<Blog> = { [formattedSortData.sortBy]: formattedSortData.sortDirection };
    const comments = await this.CommentModel.find(filter)
      .sort(sortFilter)
      .skip((+formattedSortData.pageNumber - 1) * +formattedSortData.pageSize)
      .limit(+formattedSortData.pageSize);

    const totalCount: number = await this.CommentModel.countDocuments(filter);

    const dtoComments: OutputCommentType[] = comments.map((comment: CommentsDocument) => comment.toDto());
    return new PaginationWithItems(+formattedSortData.pageNumber, +formattedSortData.pageSize, totalCount, dtoComments);
  }
}
