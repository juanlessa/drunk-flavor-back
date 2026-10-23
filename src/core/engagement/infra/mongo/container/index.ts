import { CommentsRepository } from '@/core/engagement/infra/mongo/repositories/Comments.repository';
import { RatingsRepository } from '@/core/engagement/infra/mongo/repositories/Ratings.repository';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';

const ratingsRepository: IRatingsRepository = new RatingsRepository();
export const resolveRatingsRepository = () => ratingsRepository;

const commentsRepository: ICommentsRepository = new CommentsRepository();
export const resolveCommentsRepository = () => commentsRepository;
