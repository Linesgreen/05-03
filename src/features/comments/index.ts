import { CommentsQueryRepository } from './repositories/comments/comments.query.repository';
import { CommentsRepository } from './repositories/comments/comments.repository';
import { CommentLikesQueryRepository } from './repositories/likes/comment-likes.query.repository';
import { CommentsLikesRepository } from './repositories/likes/comments-likes.repository';

export const commentProviders = [
  CommentsRepository,
  CommentsQueryRepository,
  CommentLikesQueryRepository,
  CommentsLikesRepository,
];
