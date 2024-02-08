import { IsString, Length } from 'class-validator';

export class CommentUpdateModel {
  @IsString()
  @Length(1, 1000)
  content: string;
}
