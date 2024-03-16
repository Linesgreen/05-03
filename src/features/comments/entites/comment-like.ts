import { LikeStatusType } from '../../comments/types/comments/input';

export class createCommentLike {
  commentId: number;
  postId: number;
  userId: number;
  likeStatus: LikeStatusType;
  createdAt: Date;
}
export class CommentLike {
  id: number;
  postId: number;
  blogId: number;
  createdAt: Date;
  userId: number;
  likeStatus: LikeStatusType;
}
