/* eslint-disable no-underscore-dangle */
// noinspection JSVoidFunctionReturnValueUsed

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

export class GetCommentsToPostWithLikeStatusCommand {
  constructor(
    public userId: string | null,
    public postId: string,
    public sortData: PostSortData,
  ) {}
}
//TODO узнать по поводу этого безумия
@CommandHandler(GetCommentsToPostWithLikeStatusCommand)
export class GetCommentsToPostWithLikeStatusUseCase implements ICommandHandler<GetCommentsToPostWithLikeStatusCommand> {
  constructor(
    protected postRepository: PostsRepository,
    protected commentsLikesQueryRepository: CommentsLikesQueryRepository,
    protected commentRepository: CommentsRepository,
  ) {}

  async execute(command: GetCommentsToPostWithLikeStatusCommand): Promise<PaginationWithItems<OutputCommentType>> {
    const { userId, sortData, postId } = command;
    const posts = await this.postRepository.getPostbyId(postId);
    const comments: PaginationWithItems<CommentsDocument> = await this.commentRepository.getCommentsByPostId(
      sortData,
      postId,
    );
    if (!posts) throw new NotFoundException(`Posts not found`);
    if (comments.items.length === 0) throw new NotFoundException(`Comments not found`);
    console.log(userId);
    const likeStatuses = userId ? await this.getUserLikeStatuses(comments, userId) : {};
    console.log(likeStatuses);
    return this.generateCommentsOutput(comments, likeStatuses);
  }

  private async getUserLikeStatuses(
    comments: PaginationWithItems<CommentsDocument>,
    userId: string,
  ): Promise<Record<string, LikeStatusType>> {
    const likes = await Promise.all(
      comments.items.map((comment) => this.commentsLikesQueryRepository.getLikeByUserId(comment._id, userId)),
    );
    console.log(likes);
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
  ): PaginationWithItems<OutputCommentType> {
    const updatedItems = comments.items.map((comment) => {
      const likeStatus = likeStatuses[comment._id] ?? 'None';
      return comment.toDto(likeStatus);
    });

    // Создание нового объекта, содержащего все поля из оригинального объекта posts,
    // но с обновленным массивом items
    return {
      ...comments,
      items: updatedItems,
    };
  }
}
