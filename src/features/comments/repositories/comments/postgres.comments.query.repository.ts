// noinspection ES6ShorthandObjectProperty

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { PostPgWithBlogDataDb } from '../../../posts/types/output';
import { OutputCommentType } from '../../types/comments/output';

@Injectable()
export class PostgresCommentsQueryRepository extends AbstractRepository<PostPgWithBlogDataDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async getCommentById(commentId: number, userId?: number): Promise<OutputCommentType | null> {
    const comment: OutputCommentType[] = await this.dataSource.query(
      `
          WITH
              -- Сначала формируем временную таблицу user_likes с информацией о статусе лайка конкретного пользователя для данного комментария.
              user_likes AS (
                  SELECT "likeStatus"
                  FROM public.comments_likes
                  WHERE "commentId" = $1 AND "userId" = COALESCE($2, 0) -- Если userId не задан, используем 0 как недопустимое значение
              ),
              -- Создаем временную таблицу likes_info, где считаем количество лайков и дизлайков
              likes_info AS (
                  SELECT
                      COUNT(id) FILTER (WHERE "likeStatus" = 'Like') AS likesCount,
                      COUNT(id) FILTER (WHERE "likeStatus" = 'Dislike') AS dislikesCount
                  FROM public.comments_likes
                  WHERE "commentId" = $1
              )
          -- Основной запрос, который возвращает информацию о посте с  лайками.
          SELECT
              comment."id", comment."content", comment."createdAt",
              json_build_object(
              'userId', users.id,
              'userLogin', users.login
              ) as "commentatorInfo",
              json_build_object(
                      'likesCount', li.likesCount,
                      'dislikesCount', li.dislikesCount,
                      'myStatus', COALESCE(ul."likeStatus", 'None')
              ) as "extendedLikesInfo"

          FROM public.comments comment
                   JOIN public.users users ON comment."userId" = users.id
                   CROSS JOIN likes_info li -- Добавляем информацию о лайках и дизлайках
                   LEFT JOIN user_likes ul ON true -- LEFT JOIN позволяет сохранить строки даже если совпадений в user_likes не найдено
          WHERE comment.id = $1 AND comment."active" = true
        `,
      [commentId, userId],
    );

    if (!comment[0]) return null;

    return comment[0];
  }
}
