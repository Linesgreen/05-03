import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { PostgresCommentsRepository } from '../../repositories/comments/postgres.comments.repository';

export class DeleteCommentByIdCommand {
  constructor(public commentId: number) {}
}

@CommandHandler(DeleteCommentByIdCommand)
export class DeleteCommentByIdUseCase implements ICommandHandler<DeleteCommentByIdCommand> {
  constructor(protected commentsRepository: PostgresCommentsRepository) {}

  async execute({ commentId }: DeleteCommentByIdCommand): Promise<Result<string>> {
    const isExist = await this.commentsRepository.chekIsExist(commentId);
    if (!isExist) return Result.Err(ErrorStatus.NOT_FOUND, `Comment with id ${commentId} not found`);

    await this.commentsRepository.deleteById(commentId);
    return Result.Ok(`Comment with id ${commentId} deleted`);
  }
}
