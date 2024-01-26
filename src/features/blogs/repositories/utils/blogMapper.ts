import { BlogsDb, OutputBlogType } from '../../types/output';

export const BLogMapper = (blog: BlogsDb): OutputBlogType => {
  return {
    id: blog._id,
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  };
};
