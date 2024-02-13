/* eslint-disable @typescript-eslint/explicit-function-return-type,no-underscore-dangle */
// Набор необходимых импортов
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsDocument } from '../../../comments/repositories/comments/comment.schema';
import { CommentsRepository } from '../../../comments/repositories/comments/comments.repository';
import { CommentsLikesQueryRepository } from '../../../comments/repositories/likes/comments-likes-query.repository';
import { LikeStatusType } from '../../../comments/types/comments/input';
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
  ) {}

  // Метод выполнения команды
  async execute(command: GetCommentsToPostWithLikeStatusCommand): Promise<PaginationWithItems<OutputCommentType>> {
    const { userId, sortData, postId } = command;

    // Проверяем наличие поста
    await this.checkPostExist(postId);

    // Получаем комментарии
    const comments = await this.getComments(postId, sortData);

    // Получаем статусы "лайков"
    const likeStatuses = userId ? await this.getUserLikeStatuses(comments, userId) : {};

    // Возвращаем данные
    return this.generateCommentsOutput(comments, likeStatuses);
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

  private async getUserLikeStatuses(comments: PaginationWithItems<CommentsDocument>, userId: string) {
    const likes = await Promise.all(
      comments.items.map((comment) => this.commentsLikesQueryRepository.getLikeByUserId(comment._id, userId)),
    );
    return likes.reduce(
      (statuses, like) => {
        if (like) {
          statuses[like.commentId] = like.likeStatus;
        }
        return statuses;
      },
      {} as Record<string, LikeStatusType>,
    );
  }

  private generateCommentsOutput(
    comments: PaginationWithItems<CommentsDocument>,
    likeStatuses: Record<string, LikeStatusType>,
  ) {
    const updatedItems = comments.items.map((comment) => {
      const likeStatus = likeStatuses[comment._id] ?? 'None';
      return comment.toDto(likeStatus);
    });
    return { ...comments, items: updatedItems };
  }
}
