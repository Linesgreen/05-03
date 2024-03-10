import { CommentsQueryRepository } from './repositories/comments/comments.query.repository';
import { CommentsRepository } from './repositories/comments/comments.repository';
import { PostgresCommentsQueryRepository } from './repositories/comments/postgres.comments.query.repository';
import { PostgresCommentsRepository } from './repositories/comments/postgres.comments.repository';
import { CommentsLikesRepository } from './repositories/likes/comments-likes.repository';
import { CommentsLikesQueryRepository } from './repositories/likes/comments-likes-query.repository';
import { AddLikeToCommentUseCase } from './service/useCase/add-like.useCase';
import { CreateCommentUseCase } from './service/useCase/create-comment.useCase';
import { DeleteCommentByIdUseCase } from './service/useCase/delte-comment-byId.useCase';
import { GetCommentByIdUseCase } from './service/useCase/get-comment.useCase';
import { UpdateCommentUseCase } from './service/useCase/update-comment.useCase';

export const commentProviders = [
  CommentsRepository,
  CommentsQueryRepository,
  CommentsLikesQueryRepository,
  CommentsLikesRepository,
  PostgresCommentsQueryRepository,
  PostgresCommentsRepository,
];

export const commentUseCases = [
  UpdateCommentUseCase,
  GetCommentByIdUseCase,
  DeleteCommentByIdUseCase,
  CreateCommentUseCase,
  AddLikeToCommentUseCase,
];
