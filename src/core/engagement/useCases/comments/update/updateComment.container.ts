import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { UpdateCommentService } from './UpdateComment.service';

const commentsRepository = resolveCommentsRepository();

const updateCommentService = new UpdateCommentService(commentsRepository);
export const resolveUpdateCommentService = () => updateCommentService;
