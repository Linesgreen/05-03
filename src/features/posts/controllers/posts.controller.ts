import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { ErrorResulter } from '../../../infrastructure/object-result/objcet-result';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateCommentCommand } from '../../comments/service/useCase/create-comment.useCase';
import { LikeCreateModel } from '../../comments/types/comments/input';
import { OutputCommentType } from '../../comments/types/comments/output';
import { PaginationWithItems } from '../../common/types/output';
import { PostgresPostQueryRepository } from '../repositories/post/postgres.post.query.repository';
import { AddLikeToPostCommand } from '../services/useCase/add-like.to.post.useSace';
import { GetCommentsToPostWithLikeStatusCommand } from '../services/useCase/get-comments-for-post-use.case';
import { CommentCreateModel } from '../types/input';
import { OutputPostType } from '../types/output';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    protected postgresPostQueryRepository: PostgresPostQueryRepository,
  ) {}

  @Get('/')
  async getAllPosts(
    @CurrentUser() userId: number | null,
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
  ): Promise<PaginationWithItems<OutputPostType>> {
    const post = await this.postgresPostQueryRepository.getPosts(queryData, userId);
    if (!post?.items?.length) throw new NotFoundException(`Posts  not found`);

    return post;
  }

  @Get(':postId')
  async getPost(
    @CurrentUser() userId: number | null,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<OutputPostType> {
    const post = await this.postgresPostQueryRepository.getPostById(postId, userId);
    if (!post) throw new NotFoundException(`Post with id: ${postId} not found`);

    return post;
  }

  //TODO разобраться с null в userId
  @Get(':postId/comments')
  async getCommentsForPost(
    @CurrentUser() userId: number | null,
    @Param('postId', ParseIntPipe) postId: number,
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
  ): Promise<PaginationWithItems<OutputCommentType>> {
    const result = await this.commandBus.execute(new GetCommentsToPostWithLikeStatusCommand(userId, postId, queryData));
    if (result.isFailure()) ErrorResulter.proccesError(result);
    return result.value;
  }

  @Put('/:postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async addLike(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() { likeStatus }: LikeCreateModel,
    @CurrentUser(ParseIntPipe) userId: number,
  ): Promise<void> {
    const result = await this.commandBus.execute(new AddLikeToPostCommand(postId, userId, likeStatus));
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }

  @Post(':postId/comments')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async createCommentToPost(
    @CurrentUser() userId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() { content }: CommentCreateModel,
  ): Promise<OutputCommentType> {
    const result = await this.commandBus.execute(new CreateCommentCommand(userId, postId, content));
    if (result.isFailure()) ErrorResulter.proccesError(result);
    return result.value;
  }
}
