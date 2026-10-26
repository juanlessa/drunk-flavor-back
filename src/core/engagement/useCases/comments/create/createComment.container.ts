import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { CreateCommentService } from './CreateComment.service';

const commentsRepository = resolveCommentsRepository();

const createCommentService = new CreateCommentService(commentsRepository);
export const resolveCreateCommentService = () => createCommentService;
