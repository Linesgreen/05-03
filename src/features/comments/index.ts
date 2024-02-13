import { CommentsQueryRepository } from './repositories/comments/comments.query.repository';
import { CommentsRepository } from './repositories/comments/comments.repository';
import { CommentsLikesRepository } from './repositories/likes/comments-likes.repository';
import { CommentsLikesQueryRepository } from './repositories/likes/comments-likes-query.repository';

export const commentProviders = [
  CommentsRepository,
  CommentsQueryRepository,
  CommentsLikesQueryRepository,
  CommentsLikesRepository,
];
