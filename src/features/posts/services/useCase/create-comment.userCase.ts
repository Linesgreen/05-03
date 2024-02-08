import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Comment } from '../../../comments/repositories/comment.schema';
import { CommentsRepository } from '../../../comments/repositories/comments.repository';
import { OutputCommentType } from '../../../comments/types/output';
import { UserRepository } from '../../../users/repositories/userRepository';
import { UsersDocument } from '../../../users/repositories/users-schema';
import { PostsQueryRepository } from '../../repositories/posts.query.repository';
//TODO узнать куда пихать этот юз кейс
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
  ) {}
  async execute({ userId, postId, content }: CreateCommentCommand): Promise<OutputCommentType> {
    const user: UsersDocument | null = await this.userRepository.getUserById(userId);
    if (!user) throw new InternalServerErrorException('user not found');
    const userLogin = user.accountData.login;

    const targetPost = await this.postQueryRepository.findById(postId);
    if (!targetPost) throw new NotFoundException();

    const newComment = new Comment(postId, content, { userId, userLogin });
    const newCommentInDB = await this.commentRepository.addComment(newComment);
    return newCommentInDB.toDto();
  }
}
