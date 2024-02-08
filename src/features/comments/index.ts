import { CommentsQueryRepository } from './repositories/comments.query.repository';
import { CommentsRepository } from './repositories/comments.repository';

export const commentProviders = [CommentsRepository, CommentsQueryRepository];
