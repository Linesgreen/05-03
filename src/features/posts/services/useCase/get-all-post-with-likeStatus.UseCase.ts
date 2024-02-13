/* eslint-disable no-underscore-dangle */
// noinspection JSVoidFunctionReturnValueUsed

import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommonRepository } from '../../../../infrastructure/common-likes';
import { PaginationWithItems } from '../../../common/types/output';
import { PostLikesQueryRepository } from '../../repositories/likes/post-likes.query.repository';
import { PostsRepository } from '../../repositories/post/posts.repository';
import { PostSortData } from '../../types/input';
import { OutputPostType } from '../../types/output';

export class GetAllPostsWithLikeStatusCommand {
  constructor(
    public userId: string | null,
    public sortData: PostSortData,
  ) {}
}
//TODO узнать по поводу этого безумия
@CommandHandler(GetAllPostsWithLikeStatusCommand)
export class GetAllPostsWithLikeStatusUseCase implements ICommandHandler<GetAllPostsWithLikeStatusCommand> {
  constructor(
    protected postRepository: PostsRepository,
    protected postLikesQueryRepository: PostLikesQueryRepository,
    protected commonRepository: CommonRepository,
  ) {}

  async execute(command: GetAllPostsWithLikeStatusCommand): Promise<PaginationWithItems<OutputPostType>> {
    const { userId, sortData } = command;
    const posts = await this.postRepository.getAll(sortData);

    if (!posts?.items?.length) {
      throw new NotFoundException(`Posts not found`);
    }
    //if the user is not authorized, the like status is none
    let likeStatuses = {};
    if (userId) {
      likeStatuses = await this.commonRepository.getUserLikeStatuses(
        posts,
        this.postLikesQueryRepository,
        userId,
        'postId',
      );
    }

    return this.commonRepository.generateDto(posts, likeStatuses);
  }
}
