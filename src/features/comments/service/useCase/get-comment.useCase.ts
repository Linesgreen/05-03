import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { PostgresCommentsQueryRepository } from '../../repositories/comments/postgres.comments.query.repository';
import { OutputCommentType } from '../../types/comments/output';

export class GetCommentByIdCommand {
  constructor(
    public commentId: number,
    public userId: number | null,
  ) {}
}

@CommandHandler(GetCommentByIdCommand)
export class GetCommentByIdUseCase implements ICommandHandler<GetCommentByIdCommand> {
  constructor(protected postgresCommentsQueryRepository: PostgresCommentsQueryRepository) {}

  async execute({ commentId, userId }: GetCommentByIdCommand): Promise<Result<OutputCommentType | string>> {
    const targetComment: OutputCommentType | null = await this.postgresCommentsQueryRepository.getCommentById(
      commentId,
      userId,
    );
    if (!targetComment) return Result.Err(ErrorStatus.NOT_FOUND, `Comment with id ${commentId} not found`);
    return Result.Ok(targetComment);
  }
}
