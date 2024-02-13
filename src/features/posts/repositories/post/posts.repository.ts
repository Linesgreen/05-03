import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Blog } from '../../../blogs/repositories/blogs-schema';
import { LikeStatusType } from '../../../comments/types/comments/input';
import { PaginationWithItems } from '../../../common/types/output';
import { QueryPagination } from '../../../common/utils/queryPagination';
import { PostSortData, PostUpdateType } from '../../types/input';
import { Post, PostsDocument } from './post.schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: Model<PostsDocument>,
  ) {}
  async getAll(sortData: PostSortData): Promise<PaginationWithItems<PostsDocument>> {
    const paginationData = QueryPagination.convertQueryPination(sortData);
    const sortFilter: FilterQuery<Blog> = { [paginationData.sortBy]: paginationData.sortDirection };

    const posts: PostsDocument[] = await this.PostModel.find()
      .sort(sortFilter)
      .skip((+paginationData.pageNumber - 1) * +paginationData.pageSize)
      .limit(+paginationData.pageSize);

    //const dtoPosts: OutputPostType[] = posts.map((post: PostsDocument) => post.toDto());
    const totalCount: number = await this.PostModel.countDocuments();
    return new PaginationWithItems(+paginationData.pageNumber, +paginationData.pageSize, totalCount, posts);
  }
  async findByBlogId(blogId: string, sortData: PostSortData): Promise<PaginationWithItems<PostsDocument>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = QueryPagination.convertQueryPination(sortData);

    const sortFilter: FilterQuery<Blog> = { [sortBy]: sortDirection };

    const targetPosts: PostsDocument[] | null = await this.PostModel.find({ blogId })
      .sort(sortFilter)
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    const totalCount: number = await this.PostModel.countDocuments({ blogId });

    return new PaginationWithItems(+pageNumber, +pageSize, totalCount, targetPosts);
  }
  /**
   * Create new post
   * @param newPost - Пост
   * @returns ID созданного поста
   */
  async addPost(newPost: Post): Promise<PostsDocument> {
    const newPostToDB: PostsDocument = new this.PostModel(newPost);
    await this.savePost(newPostToDB);
    return newPostToDB;
  }
  /**
   * @param params
   * @param id - post id
   * @returns true,false
   */
  async updateBlog(params: PostUpdateType, id: string): Promise<boolean> {
    const updateResult = await this.PostModel.findByIdAndUpdate(id, params);
    return !!updateResult;
  }
  /**
   * delete current post
   * @param postId
   * @returns true, false
   */
  async deleteBlog(postId: string): Promise<boolean> {
    const deleteResult = await this.PostModel.findByIdAndDelete(postId);
    return !!deleteResult;
  }
  async savePost(post: PostsDocument): Promise<void> {
    await post.save();
  }
  async getPostbyId(postId: string): Promise<PostsDocument | null> {
    return this.PostModel.findById(postId);
  }

  async updateLikesCount(
    postId: string,
    operation: 'increment' | 'decrement',
    likeStatus: LikeStatusType,
  ): Promise<void> {
    const updateField = likeStatus === 'Like' ? 'likesCount' : 'dislikesCount';
    const updateValue = operation === 'increment' ? 1 : -1;

    // Если нужно обновить оба поля (switch), вызовите эту функцию дважды с разными полями
    await this.PostModel.findByIdAndUpdate(
      postId,
      { $inc: { [`extendedLikesInfo.${updateField}`]: updateValue } },
      { new: true },
    );
  }
}
