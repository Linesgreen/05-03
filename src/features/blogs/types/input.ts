import { IsIn, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';

import { Trim } from '../../../infrastructure/decorators/transform/trim';

export class BlogCreateModel {
  @Trim()
  @Length(1, 15)
  name: string;
  @Trim()
  @Length(1, 500)
  description: string;
  @Trim()
  @Length(1, 100)
  @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
  websiteUrl: string;
}

export class PostToBlogCreateModel {
  @Trim()
  @IsString()
  @Length(1, 30)
  title: string;
  @Trim()
  @IsString()
  @Length(1, 100)
  @Trim()
  shortDescription: string;
  @IsString()
  @Trim()
  @Length(1, 1000)
  content: string;
}

export type BlogSortData = {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: string;
  pageSize?: string;
};

export class PostFromBlogSortData {
  @IsOptional()
  @IsString()
  @Trim()
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc';
  @IsOptional()
  @IsNumber()
  pageNumber?: string;
  @IsOptional()
  @IsNumber()
  pageSize?: string;
}
