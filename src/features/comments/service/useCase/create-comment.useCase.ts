import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
  async execute({ userId, postId, content }: CreateCommentCommand): Promise<OutputCommentType> {
    const newCommentToDB = new CommentToPgDB({ userId, postId, content });

    const targetPost = await this.postgresPostsRepository.chekPostIsExist(Number(postId));
    if (!targetPost) throw new NotFoundException();

    const commentId = await this.postgresCommentsRepository.addComment(newCommentToDB);
    const comment = await this.postgresQueryRepository.getCommentById(commentId, null);
    if (!comment) throw new NotFoundException();
    return comment;
  }
}
