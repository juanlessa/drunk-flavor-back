import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { ListCommentsService } from './ListComments.service';

const commentsRepository = resolveCommentsRepository();

const listCommentsService = new ListCommentsService(commentsRepository);
export const resolveListCommentsService = () => listCommentsService;
