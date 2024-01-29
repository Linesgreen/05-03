import { Injectable } from '@nestjs/common';
import { PostCreateType, PostUpdateType } from '../types/input';
import { BlogsQueryRepository } from '../../blogs/repositories/blogs.query.repository';
import { OutputPostType, PostDb } from '../types/output';
import { PostsRepository } from '../repositories/posts.repository';
import { PostsDocument } from '../repositories/post-schema';
import { OutputBlogType } from '../../blogs/types/output';

@Injectable()
export class PostService {
  constructor(
    protected postRepository: PostsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async createPost(postData: PostCreateType): Promise<OutputPostType | null> {
    const targetBlog: OutputBlogType | null = await this.blogsQueryRepository.findById(postData.blogId);

    if (!targetBlog) return null;

    const newPost = new PostDb(
      postData.title,
      postData.shortDescription,
      postData.content,
      postData.blogId,
      targetBlog!.name,
    );

    const createdPostInDb: PostsDocument = await this.postRepository.addPost(newPost);
    return createdPostInDb.toDto();
  }

  async updatePost(params: PostUpdateType, postId: string) {
    const targetPost: PostsDocument | null = await this.postRepository.getPostbyId(postId);
    if (!targetPost) return null;

    targetPost.updatePost(params);

    await this.postRepository.savePost(targetPost);
    return true;
  }
  async deleteBlog(blogId: string) {
    return await this.postRepository.deleteBlog(blogId);
  }
}
