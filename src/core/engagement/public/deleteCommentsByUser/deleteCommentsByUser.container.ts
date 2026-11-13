import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { DeleteCommentsByUserService } from './DeleteCommentsByUser.service';

const commentsRepository = resolveCommentsRepository();

const deleteCommentsByUserService = new DeleteCommentsByUserService(commentsRepository);

export const resolveDeleteCommentsByUserService = () => deleteCommentsByUserService;
