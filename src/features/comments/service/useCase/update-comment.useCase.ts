import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { PostgresCommentsRepository } from '../../repositories/comments/postgres.comments.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: number,
    public content: string,
  ) {}
}

//TODo переделать ( взять комент и поменять )
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(protected commentsRepository: PostgresCommentsRepository) {}

  async execute({ commentId, content }: UpdateCommentCommand): Promise<Result<string>> {
    const isExist = await this.commentsRepository.chekIsExist(commentId);
    if (!isExist) return Result.Err(ErrorStatus.NOT_FOUND, `Comment with id ${commentId} not found`);
    await this.commentsRepository.updateComment(commentId, content);
    return Result.Ok('Comment updated');
  }
}
