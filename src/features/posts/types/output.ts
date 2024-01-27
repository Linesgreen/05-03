import { ExtendedLikesInfoDbType, newestLike } from './likes/output';
import { v4 as uuidv4 } from 'uuid';
import { LikeStatus } from './likes/input';

export type ExtendedLikesInfoOutputType = {
  likesCount: number;
  dislikesCount: number;
  newestLikes: newestLike[];
  myStatus: LikeStatus;
};

export class PostDb {
  public _id: string;
  public createdAt: string;
  public extendedLikesInfo: ExtendedLikesInfoDbType;

  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
  ) {
    this._id = uuidv4();
    this.createdAt = new Date().toISOString();
    this.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    };
  }

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
        ...this.extendedLikesInfo,
        myStatus: 'None',
      },
    };
  }
}

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
