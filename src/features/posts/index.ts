import { PostLikesQueryRepository } from './repositories/likes/post-likes.query.repository';
import { PostLikesRepository } from './repositories/likes/post-likes.repository';
import { PostgresPostQueryRepository } from './repositories/post/postgres.post.query.repository';
import { PostgresPostRepository } from './repositories/post/postgres.post.repository';
import { PostsQueryRepository } from './repositories/post/posts.query.repository';
import { PostsRepository } from './repositories/post/posts.repository';
import { PostService } from './services/post.service';
import { AddLikeToPostUseCase } from './services/useCase/add-like.to.post.useSace';
import { GetAllPostsWithLikeStatusUseCase } from './services/useCase/get-all-post-with-likeStatus.useCase';
import { GetCommentsForPostUseCase } from './services/useCase/get-comments-for-post-use.case';
import { GetPostWithLikeStatusUseCase } from './services/useCase/get-post-with-like-status.useCase';

export const postProviders = [
  PostsRepository,
  PostsQueryRepository,
  PostService,
  PostLikesQueryRepository,
  PostLikesRepository,
  PostgresPostRepository,
  PostgresPostQueryRepository,
];

export const postsUseCases = [
  GetPostWithLikeStatusUseCase,
  AddLikeToPostUseCase,
  GetAllPostsWithLikeStatusUseCase,
  GetCommentsForPostUseCase,
];
