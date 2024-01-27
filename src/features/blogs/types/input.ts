export type BlogCreateType = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type BlogUpdateType = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type PostToBlogCreateType = {
  title: string;
  shortDescription: string;
  content: string;
};
