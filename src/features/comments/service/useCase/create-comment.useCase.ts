import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsQueryRepository } from '../../../posts/repositories/post/posts.query.repository';
import { User } from '../../../users/entites/user';
import { PostgresUserRepository } from '../../../users/repositories/postgres.user.repository';
import { UserRepository } from '../../../users/repositories/user.repository';
import { Comment } from '../../repositories/comments/comment.schema';
import { CommentsRepository } from '../../repositories/comments/comments.repository';
import { OutputCommentType } from '../../types/comments/output';

export class CreateCommentCommand {
  constructor(
    public userId: string,
    public postId: string,
    public content: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    protected postQueryRepository: PostsQueryRepository,
    protected commentRepository: CommentsRepository,
    protected userRepository: UserRepository,
    protected postgresUserRepository: PostgresUserRepository,
  ) {}
  async execute({ userId, postId, content }: CreateCommentCommand): Promise<OutputCommentType> {
    const user: User | null = await this.postgresUserRepository.findUserById(userId);
    if (!user) throw new InternalServerErrorException('user not found');
    const userLogin = user.accountData.login;

    const targetPost = await this.postQueryRepository.findById(postId);
    if (!targetPost) throw new NotFoundException();

    const newComment = new Comment(postId, content, { userId, userLogin });
    const newCommentInDB = await this.commentRepository.addComment(newComment);
    return newCommentInDB.toDto();
  }
}
