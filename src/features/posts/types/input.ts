import { IsString, Length } from 'class-validator';

import { PostIsExist } from '../../../infrastructure/decorators/validate/post-is-exist.decorator';

export class PostCreateModel {
  @Length(1, 30)
  title: string;
  @Length(1, 100)
  shortDescription: string;
  @Length(1, 1000)
  content: string;
  blogId: string;
}

export class PostUpdateType {
  @Length(1, 30)
  title: string;
  @Length(1, 30)
  shortDescription: string;
  @Length(1, 1000)
  content: string;
  blogId: string;
}
export class postIdforComment {
  @PostIsExist()
  postId: string;
}

export type PostSortData = {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: string;
  pageSize?: string;
};

export class CommentCreateModel {
  @IsString()
  @Length(20, 300)
  content: string;
}
