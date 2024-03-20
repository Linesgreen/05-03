import { LikeStatus } from './likes/input';
import { NewestLikeType } from './likes/output';

export type ExtendedLikesInfoOutputType = {
  likesCount: number;
  dislikesCount: number;
  newestLikes: NewestLikeType[];
  myStatus: LikeStatus;
};

export type OutputPostType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoOutputType;
};

export class PostPgDb {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  createdAt: Date;
}

export class PostPgWithBlogDataDb {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  blogName: string;
  createdAt: Date;
}
