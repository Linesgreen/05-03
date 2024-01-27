import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostsDocument } from './post-schema';
import { Model } from 'mongoose';
import { OutputPostType } from '../types/output';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: Model<PostsDocument>) {}

  async findById(postId: string): Promise<OutputPostType | null> {
    const targetPost: PostsDocument | null = await this.PostModel.findById(postId);
    if (!targetPost) return null;
    return targetPost.toDto();
  }
}
