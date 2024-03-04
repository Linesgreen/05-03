import { BlogsQueryRepository } from './repositories/blogs.query.repository';
import { BlogsRepository } from './repositories/blogs.repository';
import { PostgresBlogsQueryRepository } from './repositories/postgres.blogs.query.repository';
import { PostgresBlogsRepository } from './repositories/postgres.blogs.repository';
import { BlogsService } from './services/blogs.service';
import { GetPostForBlogUseCase } from './services/useCase/get-posts-for-blog.useCase';

export const blogsProviders = [
  BlogsService,
  BlogsRepository,
  BlogsQueryRepository,
  PostgresBlogsRepository,
  PostgresBlogsQueryRepository,
];
export const blogsUseCases = [GetPostForBlogUseCase];
