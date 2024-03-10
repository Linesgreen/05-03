import { Injectable, NotFoundException } from '@nestjs/common';

import { Result } from '../../../infrastructure/object-result/objcet-result';
import { PostgresBlogsRepository } from '../../blogs/repositories/postgres.blogs.repository';
import { PostCreate, PostPg } from '../entites/post';
import { PostgresPostQueryRepository } from '../repositories/post/postgres.post.query.repository';
import { PostgresPostRepository } from '../repositories/post/postgres.post.repository';
import { PostCreateModel, PostInBlogUpdateType } from '../types/input';
import { OutputPostType } from '../types/output';

@Injectable()
export class PostService {
  constructor(
    protected postgresBlogsRepository: PostgresBlogsRepository,
    protected postgresPostRepository: PostgresPostRepository,
    protected postgresPostQueryRepository: PostgresPostQueryRepository,
  ) {}
  async createPost(postData: PostCreateModel): Promise<Result<OutputPostType | string>> {
    const postCreateData: PostCreate = {
      title: postData.title,
      shortDescription: postData.shortDescription,
      content: postData.content,
      blogId: Number(postData.blogId),
    };
    const targetBlog = await this.postgresBlogsRepository.chekBlogIsExist(Number(postData.blogId));
    if (!targetBlog) return Result.Err(404, 'Blog Not Found');

    const newPost = new PostPg(postCreateData);

    const postId: string = await this.postgresPostRepository.addPost(newPost);
    const targetPost = await this.postgresPostQueryRepository.getPostById(Number(postId));
    if (!targetPost) return Result.Err(404, 'Post Not Found');
    return Result.Ok(targetPost);
  }

  async updatePost(params: PostInBlogUpdateType, postId: number): Promise<void> {
    await this.postIsExist(postId);
    await this.postgresPostRepository.updatePost(postId, params);
  }
  async deletePost(postId: number): Promise<void> {
    await this.postIsExist(postId);
    return this.postgresPostRepository.deleteById(postId);
  }
  private async postIsExist(postId: number): Promise<void> {
    const postIsExist = await this.postgresPostRepository.chekPostIsExist(postId);
    if (!postIsExist) throw new NotFoundException('Post Not Found');
  }
}
