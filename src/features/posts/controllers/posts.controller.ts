import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AuthGuard } from '../../../infrastructure/guards/auth-basic.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decrator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommentsQueryRepository } from '../../comments/repositories/comments/comments.query.repository';
import { OutputCommentType } from '../../comments/types/comments/output';
import { PaginationWithItems } from '../../common/types/output';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { PostService } from '../services/postService';
import { CreateCommentCommand } from '../services/useCase/create-comment.useCase';
import { CommentCreateModel, PostCreateModel, postIdforComment, PostSortData, PostUpdateType } from '../types/input';
import { OutputPostType } from '../types/output';

@Controller('posts')
export class PostsController {
  constructor(
    protected readonly postService: PostService,
    protected readonly postQueryRepository: PostsQueryRepository,
    protected readonly commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getAllPosts(@Query() queryData: PostSortData): Promise<PaginationWithItems<OutputPostType>> {
    return this.postQueryRepository.getAll(queryData);
  }

  @Get(':postId')
  async getPost(@Param('postId') postId: string): Promise<OutputPostType> {
    const targetPost: OutputPostType | null = await this.postQueryRepository.findById(postId);
    if (!targetPost) throw new NotFoundException('Post Not Found');
    return targetPost;
  }
  //TODO узнать насчет валидатора на отсуствие поста тут
  @Get(':postId/comments')
  async getCommentsForPost(
    @Param() { postId }: postIdforComment,
    @Query() queryData: PostSortData,
  ): Promise<PaginationWithItems<OutputCommentType>> {
    return this.commentsQueryRepository.getCommentsByPostId(queryData, postId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createPost(@Body() postCreateData: PostCreateModel): Promise<OutputPostType> {
    const newPost: OutputPostType | null = await this.postService.createPost(postCreateData);
    if (!newPost) throw new NotFoundException('Blog Not Exist');
    return newPost;
  }
  @Put(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updatePost(@Param('id') id: string, @Body() postUpdateData: PostUpdateType): Promise<void> {
    const updateResult = await this.postService.updatePost(postUpdateData, id);
    if (!updateResult) throw new NotFoundException('Blog Not Found');
    return;
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentToPost(
    @CurrentUser() userId: string,
    @Param('postId') postId: string,
    @Body() commentCreateData: CommentCreateModel,
  ): Promise<OutputCommentType> {
    const content = commentCreateData.content;
    return this.commandBus.execute(new CreateCommentCommand(userId, postId, content));
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deletePost(@Param('id') id: string): Promise<void> {
    const delteResult = await this.postService.deleteBlog(id);
    if (!delteResult) throw new NotFoundException('Blog Not Found');
    return;
  }
}
