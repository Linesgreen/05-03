export class BlogsDb {
  public _id: string;
  public createdAt: string;
  public isMembership: boolean;
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {
    this._id = crypto.randomUUID();
    this.createdAt = new Date().toISOString();
    this.isMembership = false;
  }
  toDto(): OutputBlogType {
    return {
      id: this._id,
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      createdAt: this.createdAt,
      isMembership: this.isMembership,
    };
  }
}

export type OutputBlogType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};
