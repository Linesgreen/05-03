export type PostCreateType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type PostUpdateType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type PostSortData = {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: string;
  pageSize?: string;
};
