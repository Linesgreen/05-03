import { LikeStatusType } from '../../comments/types/comments/input';

export class PostCreate {
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
}

export type NewestLikeType = {
  addedAt: string;
  userId: string;
  login: string;
};

export class LikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusType;
  newestLikes: NewestLikeType[];
}

export class PostPg {
  id: number | null;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  createdAt: Date;
  constructor(data: PostCreate) {
    this.id = null;
    this.title = data.title;
    this.shortDescription = data.shortDescription;
    this.content = data.content;
    this.blogId = data.blogId;
    this.createdAt = new Date();
  }

  //TODO object result
}
