import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { ListCommentsByDrinkService } from './ListCommentsByDrink.service';

const commentsRepository = resolveCommentsRepository();

const listCommentsByDrinkService = new ListCommentsByDrinkService(commentsRepository);
export const resolveListCommentsByDrinkService = () => listCommentsByDrinkService;
