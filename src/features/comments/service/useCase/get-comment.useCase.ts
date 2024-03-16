import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostgresCommentsQueryRepository } from '../../repositories/comments/postgres.comments.query.repository';
import { OutputCommentType } from '../../types/comments/output';

export class GetCommentByIdCommand {
  constructor(
    public commentId: string,
    public userId: string | null,
  ) {}
}

@CommandHandler(GetCommentByIdCommand)
export class GetCommentByIdUseCase implements ICommandHandler<GetCommentByIdCommand> {
  constructor(protected commentsRepository: PostgresCommentsQueryRepository) {}

  async execute({ commentId, userId }: GetCommentByIdCommand): Promise<OutputCommentType> {
    console.log(userId);
    const targetComment: OutputCommentType | null = await this.commentsRepository.getCommentById(
      Number(commentId),
      Number(userId),
    );
    if (!targetComment) throw new NotFoundException(`Comment with id ${commentId} not found`);
    return targetComment;
  }
}
