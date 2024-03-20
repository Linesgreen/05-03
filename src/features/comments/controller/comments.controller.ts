import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CommentOwnerGuard } from '../../../infrastructure/guards/comment-owner.guard';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { ErrorResulter } from '../../../infrastructure/object-result/objcet-result';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AddLikeToCommentCommand } from '../service/useCase/add-like.useCase';
import { DeleteCommentByIdCommand } from '../service/useCase/delte-comment-byId.useCase';
import { GetCommentByIdCommand } from '../service/useCase/get-comment.useCase';
import { UpdateCommentCommand } from '../service/useCase/update-comment.useCase';
import { CommentUpdateModel, LikeCreateModel } from '../types/comments/input';
import { OutputCommentType } from '../types/comments/output';

@Controller('comments')
export class CommentsController {
  constructor(private commandBus: CommandBus) {}

  //TODO нужен ли командбас при гет запросе
  @Get(':commentId')
  async getCommentById(
    @CurrentUser() userId: number | null,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<OutputCommentType> {
    const result = await this.commandBus.execute(new GetCommentByIdCommand(commentId, userId));
    if (result.isFailure()) ErrorResulter.proccesError(result);
    return result.value;
  }

  @Put(':commentId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CommentOwnerGuard)
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() { content }: CommentUpdateModel,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateCommentCommand(commentId, content));
  }

  @Put('/:commentId/like-status')
  @HttpCode(204)
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
  async deleteComment(@Param('commentId', ParseIntPipe) commentId: number): Promise<void> {
    const result = await this.commandBus.execute(new DeleteCommentByIdCommand(commentId));
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }
}
