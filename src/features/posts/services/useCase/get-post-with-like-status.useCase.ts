import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostgresPostQueryRepository } from '../../repositories/post/postgres.post.query.repository';
import { OutputPostType } from '../../types/output';

export class GetPostWithLikeStatusCommand {
  constructor(
    public postId: number,
    public userId: string | null,
  ) {}
}

@CommandHandler(GetPostWithLikeStatusCommand)
export class GetPostWithLikeStatusUseCase implements ICommandHandler<GetPostWithLikeStatusCommand> {
  constructor(protected postgresPostQueryRepository: PostgresPostQueryRepository) {}

  async execute({ postId, userId }: GetPostWithLikeStatusCommand): Promise<OutputPostType> {
    const post = await this.postgresPostQueryRepository.getPostById(postId, Number(userId));
    if (!post) throw new NotFoundException();
    return post;
  }
}
