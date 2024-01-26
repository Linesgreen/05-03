import { v4 as uuidv4 } from 'uuid';

export class BlogsDb {
  public _id: string;
  public createdAt: string;
  public isMembership: boolean;
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {
    this._id = uuidv4();
    this.createdAt = new Date().toISOString();
    this.isMembership = false;
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
