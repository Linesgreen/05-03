import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostgresCommentsRepository } from '../../repositories/comments/postgres.comments.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: number,
    public content: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(protected commentsRepository: PostgresCommentsRepository) {}

  async execute({ commentId, content }: UpdateCommentCommand): Promise<void> {
    await this.commentsRepository.updateComment(commentId, content);
  }
}
