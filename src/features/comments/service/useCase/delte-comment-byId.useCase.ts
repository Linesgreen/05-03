import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostgresCommentsRepository } from '../../repositories/comments/postgres.comments.repository';

export class DeleteCommentByIdCommand {
  constructor(public commentId: number) {}
}

@CommandHandler(DeleteCommentByIdCommand)
export class DeleteCommentByIdUseCase implements ICommandHandler<DeleteCommentByIdCommand> {
  constructor(protected commentsRepository: PostgresCommentsRepository) {}

  async execute({ commentId }: DeleteCommentByIdCommand): Promise<void> {
    const isExist = await this.commentsRepository.chekIsExist(commentId);
    console.log(isExist);
    if (!isExist) throw new NotFoundException();
    await this.commentsRepository.deleteById(commentId);
  }
}
