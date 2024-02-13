export type ExtendedLikesInfoDbType = {
  likesCount: number;
  dislikesCount: number;
  newestLikes: NewestLikeType[];
};

export type NewestLikeType = {
  addedAt: string;
  userId: string;
  login: string;
};
