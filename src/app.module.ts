import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { authProviders } from './features/auth';
import { AuthController } from './features/auth/controllers/auth.controller';
import { jwtConstants } from './features/auth/service/constants';
import { ChangeUserConfirmationUserCase } from './features/auth/service/useCases/change-User-Confirmation-UserCase';
import { EmailResendingUseCase } from './features/auth/service/useCases/email-resending.useCase';
import { GetInformationAboutUserCase } from './features/auth/service/useCases/user-get-information-about-me.useCase';
import { UserLoginUseCase } from './features/auth/service/useCases/user-login.useCase';
import { UserRegistrationUseCase } from './features/auth/service/useCases/user-registration,UseCase';
import { JwtStrategy } from './features/auth/strategies/jwt.strategy';
import { LocalStrategy } from './features/auth/strategies/local.strategy';
import { blogsProviders } from './features/blogs';
import { BlogsController } from './features/blogs/controllers/blogs.controller';
import { Blog, BlogSchema } from './features/blogs/repositories/blogs-schema';
import { commentProviders } from './features/comments';
import { CommentsController } from './features/comments/controller/comments.controller';
import { Comment, CommentSchema } from './features/comments/repositories/comment.schema';
import { DeleteCommentByIdUseCase } from './features/comments/service/useCase/delte-comment-byId.useCase';
import { UpdateCommentUseCase } from './features/comments/service/useCase/update-comment.useCase';
import { postProviders } from './features/posts';
import { PostsController } from './features/posts/controllers/posts.controller';
import { Post, PostSchema } from './features/posts/repositories/post.schema';
import { CreateCommentUseCase } from './features/posts/services/useCase/create-comment.useCase';
import { TestingController } from './features/testing/controllers/testing.controller';
import { userProviders } from './features/users';
import { UserController } from './features/users/controllers/user.controller';
import { User, UserSchema } from './features/users/repositories/users-schema';
import { ConfCodeIsValidConstraint } from './infrastructure/decorators/validate/conf-code.decorator';
import { EmailIsConformedConstraint } from './infrastructure/decorators/validate/email-is-conformed.decorator';
import { NameIsExistConstraint } from './infrastructure/decorators/validate/name-is-exist.decorator';
import { PostIsExistConstraint } from './infrastructure/decorators/validate/post-is-exist.decorator';
import { MailModule } from './mail/mail.module';

const useCases = [
  UserLoginUseCase,
  EmailResendingUseCase,
  ChangeUserConfirmationUserCase,
  UserRegistrationUseCase,
  GetInformationAboutUserCase,
  CreateCommentUseCase,
  DeleteCommentByIdUseCase,
  UpdateCommentUseCase,
];

@Module({
  imports: [
    //Регистрируем для испльзования Passport strategy
    PassportModule,
    //Регистрируем для испльзования @CommandHandler
    CqrsModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
    }),
    MailModule,
  ],
  controllers: [
    BlogsController,
    PostsController,
    UserController,
    AuthController,
    TestingController,
    CommentsController,
  ],
  providers: [
    ...blogsProviders,
    ...postProviders,
    ...userProviders,
    ...authProviders,
    ...commentProviders,
    ...useCases,
    NameIsExistConstraint,
    EmailIsConformedConstraint,
    ConfCodeIsValidConstraint,
    PostIsExistConstraint,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AppModule {}
