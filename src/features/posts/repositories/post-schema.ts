import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { newestLike } from '../types/likes/output';
import { OutputPostType } from '../types/output';

@Schema()
export class ExtendedLikesInfo {
  @Prop({ required: true, default: 0 })
  likesCount: number;

  @Prop({ required: true, default: 0 })
  dislikesCount: number;

  @Prop({ _id: false, required: true, default: [] })
  newestLikes: newestLike[];
}

export const ExtendedLikesInfoSchema = SchemaFactory.createForClass(ExtendedLikesInfo);

@Schema()
export class Post {
  @Prop({
    required: true,
  })
  _id: string;

  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  shortDescription: string;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: true,
  })
  blogId: string;

  @Prop({
    required: true,
  })
  blogName: string;

  @Prop({
    required: true,
  })
  createdAt: string;
  @Prop({ _id: false, required: true, type: ExtendedLikesInfoSchema })
  extendedLikesInfo: ExtendedLikesInfo;

  toDto(): OutputPostType {
    return {
      id: this._id.toString(),
      title: this.title,
      shortDescription: this.shortDescription,
      content: this.content,
      blogId: this.blogId,
      blogName: this.blogName,
      createdAt: this.createdAt,
      extendedLikesInfo: {
        likesCount: this.extendedLikesInfo.likesCount,
        dislikesCount: this.extendedLikesInfo.dislikesCount,
        myStatus: 'None',
        newestLikes: this.extendedLikesInfo.newestLikes,
      },
    };
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
export type PostsDocument = HydratedDocument<Post>;
