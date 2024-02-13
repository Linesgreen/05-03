import { PostLikesQueryRepository } from './repositories/likes/post-likes.query.repository';
import { PostLikesRepository } from './repositories/likes/post-likes.repository';
import { PostsQueryRepository } from './repositories/post/posts.query.repository';
import { PostsRepository } from './repositories/post/posts.repository';
import { PostService } from './services/postService';

export const postProviders = [
  PostsRepository,
  PostsQueryRepository,
  PostService,
  PostLikesQueryRepository,
  PostLikesRepository,
];
