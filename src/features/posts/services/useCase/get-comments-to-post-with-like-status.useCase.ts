/* eslint-disable @typescript-eslint/explicit-function-return-type,no-underscore-dangle */
// Набор необходимых импортов
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommonRepository } from '../../../../infrastructure/common-likes';
import { CommentsDocument } from '../../../comments/repositories/comments/comment.schema';
import { CommentsRepository } from '../../../comments/repositories/comments/comments.repository';
import { CommentsLikesQueryRepository } from '../../../comments/repositories/likes/comments-likes-query.repository';
import { OutputCommentType } from '../../../comments/types/comments/output';
import { PaginationWithItems } from '../../../common/types/output';
import { PostsRepository } from '../../repositories/post/posts.repository';
import { PostSortData } from '../../types/input';

// Команда
export class GetCommentsToPostWithLikeStatusCommand {
  constructor(
    public userId: string | null,
    public postId: string,
    public sortData: PostSortData,
  ) {}
}

// Обработчик команды
@CommandHandler(GetCommentsToPostWithLikeStatusCommand)
export class GetCommentsToPostWithLikeStatusUseCase implements ICommandHandler<GetCommentsToPostWithLikeStatusCommand> {
  // Конструктор с внедрением зависимостей
  constructor(
    protected postRepository: PostsRepository,
    protected commentRepository: CommentsRepository,
    protected commentsLikesQueryRepository: CommentsLikesQueryRepository,
    protected commonRepository: CommonRepository,
  ) {}

  // Метод выполнения команды
  async execute(command: GetCommentsToPostWithLikeStatusCommand): Promise<PaginationWithItems<OutputCommentType>> {
    const { userId, sortData, postId } = command;

    await this.checkPostExist(postId);

    const comments = await this.getComments(postId, sortData);

    let likeStatuses = {};
    if (userId) {
      likeStatuses = await this.commonRepository.getUserLikeStatuses(
        comments,
        this.commentsLikesQueryRepository,
        userId,
        'commentId',
      );
    }

    return this.commonRepository.generateDto(comments, likeStatuses);
  }

  private async checkPostExist(postId: string) {
    const post = await this.postRepository.getPostbyId(postId);
    if (!post) throw new NotFoundException(`Post not found`);
  }

  private async getComments(postId: string, sortData: PostSortData) {
    const comments: PaginationWithItems<CommentsDocument> = await this.commentRepository.getCommentsByPostId(
      sortData,
      postId,
    );
    if (comments.items.length === 0) throw new NotFoundException(`Comments not found`);
    return comments;
  }
}
