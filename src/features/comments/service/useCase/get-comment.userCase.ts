import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsDocument } from '../../repositories/comments/comment.schema';
import { CommentsRepository } from '../../repositories/comments/comments.repository';
import { CommentLikesQueryRepository } from '../../repositories/likes/comment-likes.query.repository';
import { LikeStatusType } from '../../types/comments/input';
import { OutputCommentType } from '../../types/comments/output';

export class GetCommentByIdCommand {
  constructor(
    public commentId: string,
    public userId: string | null,
  ) {}
}

@CommandHandler(GetCommentByIdCommand)
export class GetCommentByIdUseCase implements ICommandHandler<GetCommentByIdCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected commentLikesQueryRepository: CommentLikesQueryRepository,
  ) {}

  async execute({ commentId, userId }: GetCommentByIdCommand): Promise<OutputCommentType> {
    let likeStatus: LikeStatusType = 'None';
    if (userId) {
      const userLike = await this.commentLikesQueryRepository.getLikeByUserId(commentId, userId);
      likeStatus = userLike?.likeStatus ?? 'None';
    }
    const targetComment: CommentsDocument | null = await this.commentsRepository.getCommentById(commentId);
    if (!targetComment) throw new NotFoundException();
    return targetComment.toDto(likeStatus);
  }
}
