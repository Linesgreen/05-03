//TODO укзнать куда пихать тип
export type OutputCommentType = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
};

export type LikeStatus = 'None' | 'Like' | 'Dislike';
