import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateCommentCommand } from '../../comments/service/useCase/create-comment.useCase';
import { LikeCreateModel } from '../../comments/types/comments/input';
import { OutputCommentType } from '../../comments/types/comments/output';
import { PaginationWithItems } from '../../common/types/output';
import { AddLikeToPostCommand } from '../services/useCase/add-like.to.post.useSace';
import { GetAllPostsWithLikeStatusCommand } from '../services/useCase/get-all-post-with-likeStatus.useCase';
import { GetCommentsToPostWithLikeStatusCommand } from '../services/useCase/get-comments-for-post-use.case';
import { GetPostWithLikeStatusCommand } from '../services/useCase/get-post-with-like-status.useCase';
import { CommentCreateModel } from '../types/input';
import { OutputPostType } from '../types/output';

@Controller('posts')
export class PostsController {
  constructor(private commandBus: CommandBus) {}

  @Get('/')
  async getAllPosts(
    @CurrentUser() userId: string,
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
  ): Promise<PaginationWithItems<OutputPostType>> {
    return this.commandBus.execute(new GetAllPostsWithLikeStatusCommand(userId, queryData));
  }

  @Get(':postId')
  async getPost(@CurrentUser() userId: string, @Param('postId', ParseIntPipe) postId: number): Promise<OutputPostType> {
    return this.commandBus.execute(new GetPostWithLikeStatusCommand(postId, userId));
  }

  @Get(':postId/comments')
  async getCommentsForPost(
    @CurrentUser() userId: string,
    @Param('postId') postId: string,
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
  ): Promise<PaginationWithItems<OutputCommentType>> {
    return this.commandBus.execute(new GetCommentsToPostWithLikeStatusCommand(userId, postId, queryData));
  }

  @Put('/:postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async addLike(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() { likeStatus }: LikeCreateModel,
    @CurrentUser(ParseIntPipe) userId: number,
  ): Promise<void> {
    return this.commandBus.execute(new AddLikeToPostCommand(postId, userId, likeStatus));
  }

  @Post(':postId/comments')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async createCommentToPost(
    @CurrentUser() userId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() { content }: CommentCreateModel,
  ): Promise<OutputCommentType> {
    return this.commandBus.execute(new CreateCommentCommand(userId, postId, content));
  }
}
