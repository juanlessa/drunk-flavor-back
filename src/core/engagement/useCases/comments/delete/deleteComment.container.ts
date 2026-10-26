import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { DeleteCommentService } from './DeleteComment.service';

const commentsRepository = resolveCommentsRepository();

const deleteCommentService = new DeleteCommentService(commentsRepository);
export const resolveDeleteCommentService = () => deleteCommentService;
