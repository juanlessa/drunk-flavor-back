import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { ListMyCommentsService } from './ListMyComments.service';

const commentsRepository = resolveCommentsRepository();

const listMyCommentsService = new ListMyCommentsService(commentsRepository);
export const resolveListMyCommentsService = () => listMyCommentsService;
