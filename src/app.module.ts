import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BlogsController } from './features/blogs/controllers/blogs.controller';
import { Blog, BlogSchema } from './features/blogs/repositories/blogs-schema';
import { Post, PostSchema } from './features/posts/repositories/post-schema';
import { PostsController } from './features/posts/controllers/posts.controller';
import { blogsProviders } from './features/blogs';
import { postProviders } from './features/posts';
import { TestingController } from './features/testing/controllers/testing.controller';
import { userProviders } from './features/users';
import { User, UserSchema } from './features/users/repositories/users-schema';
import { UserController } from './features/users/controllers/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, UserController, TestingController],
  providers: [...blogsProviders, ...postProviders, ...userProviders],
})
export class AppModule {}
