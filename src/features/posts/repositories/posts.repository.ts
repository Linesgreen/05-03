import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostsDocument } from './post-schema';
import { Model } from 'mongoose';
import { PostDb } from '../types/output';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: Model<PostsDocument>,
  ) {}
  /**
   * Create new post
   * @param newPost - Пост
   * @returns ID созданного поста
   */
  async addPost(newPost: PostDb): Promise<PostsDocument> {
    const newPostToDB: PostsDocument = new this.PostModel(newPost);
    await newPostToDB.save();
    return newPostToDB;
  }
}
