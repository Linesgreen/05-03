import { CommentCreateModel } from '../../posts/types/input';

export class PostCreate {
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
}

export class CommentCreateData extends CommentCreateModel {
  postId: number;
  userId: string;
}

export class CommentToPgDB {
  title: string;
  content: string;
  postId: number;
  userId: number;
  createdAt: Date;
  constructor(data: CommentCreateData) {
    this.content = data.content;
    this.postId = data.postId;
    this.userId = Number(data.userId);
    this.createdAt = new Date();
  }
}
