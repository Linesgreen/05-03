import { IsString, Length } from 'class-validator';

export class CommentUpdateModel {
  @IsString()
  @Length(30, 300)
  content: string;
}
