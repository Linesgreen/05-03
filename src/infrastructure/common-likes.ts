/* eslint-disable no-underscore-dangle,@typescript-eslint/no-explicit-any,@typescript-eslint/explicit-function-return-type */
// noinspection JSUnusedGlobalSymbols

import { Injectable } from '@nestjs/common';

import { LikeStatusType } from '../features/comments/types/comments/input';
import { PaginationWithItems } from '../features/common/types/output';
@Injectable()
export class CommonRepository {
  async getUserLikeStatuses<T extends { _id: string }>(
    items: PaginationWithItems<T>,
    repository: any,
    userId: string,
    likeIdName: string,
  ) {
    const likes = await Promise.all(items.items.map((item) => repository.getLikeByUserId(item._id, userId)));
    return likes.reduce(
      (statuses, like) => {
        if (like) {
          statuses[like[likeIdName]] = like.likeStatus;
        }
        return statuses;
      },
      {} as Record<string, LikeStatusType>,
    );
  }
  generateDto<T extends { _id: string } & { toDto: (likeStatus: LikeStatusType) => any }>(
    items: PaginationWithItems<T>,
    likeStatuses: Record<string, LikeStatusType>,
  ) {
    const updatedItems = items.items.map((item) => {
      const likeStatus = likeStatuses[item._id] ?? 'None';
      return item.toDto(likeStatus);
    });
    return { ...items, items: updatedItems };
  }
}
