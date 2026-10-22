import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { ModerateCommentService } from './ModerateComment.service';

const commentsRepository = resolveCommentsRepository();

const moderateCommentService = new ModerateCommentService(commentsRepository);
export const resolveModerateCommentService = () => moderateCommentService;
