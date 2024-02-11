import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CommentOwnerGuard } from '../../../infrastructure/guards/comment-owner-guard';
import { CurrentUser } from '../../auth/decorators/current-user.decrator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommentsQueryRepository } from '../repositories/comments/comments.query.repository';
import { AddLikeToCommentCommand } from '../service/useCase/add-like.useCase';
import { DeleteCommentByIdCommand } from '../service/useCase/delte-comment-byId.useCase';
import { UpdateCommentCommand } from '../service/useCase/update-comment.useCase';
import { CommentUpdateModel, LikeCreateModel } from '../types/comments/input';
import { OutputCommentType } from '../types/comments/output';

@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private commentQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':commentId')
  async getCommentById(@Param('commentId') commentId: string): Promise<OutputCommentType> {
    const targetComment: OutputCommentType | null = await this.commentQueryRepository.getCommentById(commentId);
    if (!targetComment) throw new NotFoundException();
    return targetComment;
  }

  @Put(':commentId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CommentOwnerGuard)
  async updateComment(@Param('commentId') commentId: string, @Body() { content }: CommentUpdateModel): Promise<void> {
    console.log(commentId);
    await this.commandBus.execute(new UpdateCommentCommand(commentId, content));
    return;
  }

  @Put('/:commentId/like-status')
  @UseGuards(JwtAuthGuard)
  async addLike(
    @Param('commentId') commentId: string,
    @Body() { likeStatus }: LikeCreateModel,
    @CurrentUser() userId: string,
  ): Promise<void> {
    await this.commandBus.execute(new AddLikeToCommentCommand(commentId, userId, likeStatus));
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard, CommentOwnerGuard)
  @HttpCode(204)
  async deleteComment(@Param('commentId') commentId: string): Promise<void> {
    await this.commandBus.execute(new DeleteCommentByIdCommand(commentId));
    return;
  }
}
