import { Injectable, NotFoundException } from '@nestjs/common';

import { PostgresBlogsRepository } from '../../blogs/repositories/postgres.blogs.repository';
import { PostCreate, PostPg } from '../entites/post';
import { PostgresPostQueryRepository } from '../repositories/post/postgres.post.query.repository';
import { PostgresPostRepository } from '../repositories/post/postgres.post.repository';
import { PostsRepository } from '../repositories/post/posts.repository';
import { PostCreateModel, PostInBlogUpdateType } from '../types/input';
import { OutputPostType } from '../types/output';

@Injectable()
export class PostService {
  constructor(
    protected postRepository: PostsRepository,
    protected postgresBlogsRepository: PostgresBlogsRepository,
    protected postgresPostRepository: PostgresPostRepository,
    protected postgresPostQueryRepository: PostgresPostQueryRepository,
  ) {}
  async createPost(postData: PostCreateModel): Promise<OutputPostType | null> {
    const postCreateData: PostCreate = {
      title: postData.title,
      shortDescription: postData.shortDescription,
      content: postData.content,
      blogId: Number(postData.blogId),
    };
    const targetBlog = await this.postgresBlogsRepository.chekBlogIsExist(Number(postData.blogId));
    if (!targetBlog) throw new NotFoundException('Blog Not Found');

    const newPost = new PostPg(postCreateData);

    const postId: string = await this.postgresPostRepository.addPost(newPost);
    return this.postgresPostQueryRepository.getPostById(Number(postId));
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
