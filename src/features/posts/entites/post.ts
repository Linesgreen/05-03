export class PostCreateModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
}

export class PostPg {
  id: number | null;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  createdAt: Date;
  constructor(data: PostCreateModel) {
    this.id = null;
    this.title = data.title;
    this.shortDescription = data.shortDescription;
    this.content = data.content;
    this.blogId = data.blogId;
    this.createdAt = new Date();
  }
}
