import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostsDocument } from './post-schema';
import { Model } from 'mongoose';
import { OutputPostType } from '../types/output';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: Model<PostsDocument>) {}

  async getAll(): Promise<OutputPostType[]> {
    const allPosts: PostsDocument[] = await this.PostModel.find().exec();
    return allPosts.map((post: PostsDocument) => post.toDto());
  }

  async findById(postId: string): Promise<OutputPostType | null> {
    const targetPost: PostsDocument | null = await this.PostModel.findById(postId);
    if (!targetPost) return null;
    return targetPost.toDto();
  }

  async findByBlogId(blogId: string): Promise<OutputPostType[] | null> {
    const targetPosts: PostsDocument[] | null = await this.PostModel.find({ blogId: blogId }).exec();
    if (!targetPosts) return null;
    return targetPosts.map((post: PostsDocument) => post.toDto());
  }
}
