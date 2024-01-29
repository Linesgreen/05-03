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

export type BlogSortData = {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: string;
  pageSize?: string;
};
