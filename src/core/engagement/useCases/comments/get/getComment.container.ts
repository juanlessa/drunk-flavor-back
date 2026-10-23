import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { GetCommentService } from './GetComment.service';

const commentsRepository = resolveCommentsRepository();

const getCommentService = new GetCommentService(commentsRepository);
export const resolveGetCommentService = () => getCommentService;
