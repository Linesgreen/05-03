import { BlogsService } from './services/blogs.service';
import { BlogsRepository } from './repositories/blogs.repository';
import { BlogsQueryRepository } from './repositories/blogs.query.repository';

export const blogsProviders = [BlogsService, BlogsRepository, BlogsQueryRepository];
