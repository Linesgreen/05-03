import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cat, CatSchema } from './features/cats/cats-schema';
import { CatsRepository } from './features/cats/catsRepository';
import { ConfigModule } from '@nestjs/config';
import { CatsController } from './features/cats/cats.controller';
import { BlogsController } from './features/blogs/blogs.controller';
import { BlogsService } from './features/blogs/blogs.service';
import { BlogsRepository } from './features/blogs/repositories/blogs.repository';
import { BlogsQueryRepository } from './features/blogs/repositories/blogs.query.repository';
import { Blog, BlogSchema } from './features/blogs/blogs-schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    MongooseModule.forFeature([
      {
        name: Cat.name,
        schema: CatSchema,
      },
      {
        name: Blog.name,
        schema: BlogSchema,
      },
    ]),
  ],
  controllers: [CatsController, BlogsController],
  providers: [
    CatsRepository,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
  ],
})
export class AppModule {}
