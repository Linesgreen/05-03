import { LikeStatusType } from '../../comments/types/comments/input';

export class createPostLike {
  postId: number;
  blogId: number;
  userId: number;
  likeStatus: LikeStatusType;
  createdAt: Date;
}
export class PostLike {
  id: number;
  postId: number;
  blogId: number;
  createdAt: Date;
  userId: number;
  likeStatus: LikeStatusType;
}

export class PostLikeFromDb extends PostLike {
  login: string;
}
