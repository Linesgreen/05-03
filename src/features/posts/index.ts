import { PostsRepository } from './repositories/posts.repository';
import { PostService } from './services/postService';
import { PostsQueryRepository } from './repositories/posts.query.repository';

export const postProviders = [PostsRepository, PostsQueryRepository, PostService];
