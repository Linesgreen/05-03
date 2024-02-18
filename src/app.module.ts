/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';

import { authProviders } from './features/auth';
import { AuthController } from './features/auth/controllers/auth.controller';
import { SessionDb, SessionSchema } from './features/auth/repository/seesion.schema';
import { jwtConstants } from './features/auth/service/constants';
import { ChangeUserConfirmationUserCase } from './features/auth/service/useCases/change-User-Confirmation-UserCase';
import { EmailResendingUseCase } from './features/auth/service/useCases/email-resending.useCase';
import { RefreshTokenUseCase } from './features/auth/service/useCases/refresh-token.useCase';
import { GetInformationAboutUserCase } from './features/auth/service/useCases/user-get-information-about-me.useCase';
import { UserLoginUseCase } from './features/auth/service/useCases/user-login.useCase';
import { UserRegistrationUseCase } from './features/auth/service/useCases/user-registration.UseCase';
import { CookieJwtStrategy } from './features/auth/strategies/cookie.jwt.strategy';
import { JwtStrategy } from './features/auth/strategies/jwt.strategy';
import { LocalStrategy } from './features/auth/strategies/local.strategy';
import { blogsProviders } from './features/blogs';
import { BlogsController } from './features/blogs/controllers/blogs.controller';
import { Blog, BlogSchema } from './features/blogs/repositories/blogs-schema';
import { GetPostForBlogUseCase } from './features/blogs/services/useCase/get-posts-for-blog.useCase';
import { BlogIsExistConstraint } from './features/blogs/validate/blog-is-exist.decorator';
import { commentProviders } from './features/comments';
import { CommentsController } from './features/comments/controller/comments.controller';
import { Comment, CommentSchema } from './features/comments/repositories/comments/comment.schema';
import { CommentLikes, CommentsLikesSchema } from './features/comments/repositories/likes/likes.schema';
import { AddLikeToCommentUseCase } from './features/comments/service/useCase/add-like.useCase';
import { CreateCommentUseCase } from './features/comments/service/useCase/create-comment.useCase';
import { DeleteCommentByIdUseCase } from './features/comments/service/useCase/delte-comment-byId.useCase';
import { GetCommentByIdUseCase } from './features/comments/service/useCase/get-comment.userCase';
import { UpdateCommentUseCase } from './features/comments/service/useCase/update-comment.useCase';
import { postProviders } from './features/posts';
import { PostsController } from './features/posts/controllers/posts.controller';
import { PostLikes, PostLikesSchema } from './features/posts/repositories/likes/post-likes.schema';
import { Post, PostSchema } from './features/posts/repositories/post/post.schema';
import { AddLikeToPostUseCase } from './features/posts/services/useCase/add-like.to.post.useSace';
import { GetAllPostsWithLikeStatusUseCase } from './features/posts/services/useCase/get-all-post-with-likeStatus.UseCase';
import { GetCommentsToPostWithLikeStatusUseCase } from './features/posts/services/useCase/get-comments-to-post-with-like-status.useCase';
import { GetPostWithLikeStatusUseCase } from './features/posts/services/useCase/get-post-with-like-status.useCase';
import { SecurityController } from './features/security/controllers/security.controller';
import { TestingController } from './features/testing/controllers/testing.controller';
import { userProviders } from './features/users';
import { UserController } from './features/users/controllers/user.controller';
import { User, UserSchema } from './features/users/repositories/users-schema';
import { CommonRepository } from './infrastructure/common-likes';
import { ConfCodeIsValidConstraint } from './infrastructure/decorators/validate/conf-code.decorator';
import { EmailIsConformedConstraint } from './infrastructure/decorators/validate/email-is-conformed.decorator';
import { LikeStatusConstraint } from './infrastructure/decorators/validate/like-status.decorator';
import { NameIsExistConstraint } from './infrastructure/decorators/validate/name-is-exist.decorator';
import { PostIsExistConstraint } from './infrastructure/decorators/validate/post-is-exist.decorator';
import { PayloadFromJwtMiddleware } from './infrastructure/middleware/payload-from-jwt.middleware';
import { MailModule } from './mail/mail.module';
//TODO как и провайдеры
const useCases = [
  UserLoginUseCase,
  EmailResendingUseCase,
  ChangeUserConfirmationUserCase,
  UserRegistrationUseCase,
  GetInformationAboutUserCase,
  CreateCommentUseCase,
  DeleteCommentByIdUseCase,
  UpdateCommentUseCase,
  AddLikeToCommentUseCase,
  GetCommentByIdUseCase,
  AddLikeToPostUseCase,
  GetPostWithLikeStatusUseCase,
  GetAllPostsWithLikeStatusUseCase,
  GetCommentsToPostWithLikeStatusUseCase,
  GetPostForBlogUseCase,
  RefreshTokenUseCase,
];

@Module({
  imports: [
    //Регистрируем для испльзования Passport strategy
    PassportModule,
    //Регистрируем для испльзования @CommandHandler
    CqrsModule,
    ConfigModule.forRoot(),

    MongooseModule.forRoot(process.env.MONGO_URL_LOCAl!),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLikes.name, schema: CommentsLikesSchema },
      { name: PostLikes.name, schema: PostLikesSchema },
      { name: SessionDb.name, schema: SessionSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
    }),
    MailModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
  ],
  controllers: [
    BlogsController,
    PostsController,
    UserController,
    AuthController,
    TestingController,
    CommentsController,
    SecurityController,
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
    LikeStatusConstraint,
    ConfCodeIsValidConstraint,
    PostIsExistConstraint,
    BlogIsExistConstraint,
    LocalStrategy,
    JwtStrategy,
    CookieJwtStrategy,
    CommonRepository,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PayloadFromJwtMiddleware)
      .forRoutes(
        { path: 'comments/:commentId', method: RequestMethod.GET },
        { path: 'posts/:postId', method: RequestMethod.GET },
        { path: 'posts/:postId/comments', method: RequestMethod.GET },
        { path: 'posts', method: RequestMethod.GET },
        { path: 'blogs/:blogId/posts', method: RequestMethod.GET },
      );
  }
}
