import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { PostgresPostRepository } from '../../../posts/repositories/post/postgres.post.repository';
import { CommentToPgDB } from '../../entites/commentPG';
import { PostgresCommentsQueryRepository } from '../../repositories/comments/postgres.comments.query.repository';
import { PostgresCommentsRepository } from '../../repositories/comments/postgres.comments.repository';
import { OutputCommentType } from '../../types/comments/output';

export class CreateCommentCommand {
  constructor(
    public userId: number,
    public postId: number,
    public content: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    protected postgresCommentsRepository: PostgresCommentsRepository,
    protected postgresQueryRepository: PostgresCommentsQueryRepository,
    protected postgresPostsRepository: PostgresPostRepository,
  ) {}
  async execute({ userId, postId, content }: CreateCommentCommand): Promise<Result<string | OutputCommentType>> {
    const newCommentToDB = new CommentToPgDB({ userId, postId, content });

    const targetPost = await this.postgresPostsRepository.chekPostIsExist(Number(postId));
    if (!targetPost) return Result.Err(ErrorStatus.NOT_FOUND, `Post with id ${postId} not found`);

    const commentId = await this.postgresCommentsRepository.addComment(newCommentToDB);
    const comment = await this.postgresQueryRepository.getCommentById(commentId, null);
    if (!comment) return Result.Err(ErrorStatus.NOT_FOUND, `Comment with id ${commentId} not found`);
    return Result.Ok(comment);
  }
}
