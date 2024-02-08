import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommentsQueryRepository } from '../repositories/comments.query.repository';
import { DeleteCommentByIdCommand } from '../service/useCase/delte-comment-byId.useCase';
import { UpdateCommentCommand } from '../service/useCase/update-comment.useCase';
import { CommentUpdateModel } from '../types/input';
import { OutputCommentType } from '../types/output';

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
  @UseGuards(JwtAuthGuard)
  async updateComment(@Param('commentId') commentId: string, @Body() { content }: CommentUpdateModel): Promise<void> {
    console.log(commentId);
    await this.commandBus.execute(new UpdateCommentCommand(commentId, content));
    return;
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteComment(@Param('commentId') commentId: string): Promise<void> {
    await this.commandBus.execute(new DeleteCommentByIdCommand(commentId));
    return;
  }
}
