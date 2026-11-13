import { EngagementModule } from './EngagementModule';
import { IEngagementModule } from './IEngagementModule';
import { resolveDeleteCommentsByUserService } from './deleteCommentsByUser/deleteCommentsByUser.container';

const deleteCommentsByUserService = resolveDeleteCommentsByUserService();

const engagementModule: IEngagementModule = new EngagementModule(deleteCommentsByUserService);

export const resolveEngagementModule = (): IEngagementModule => engagementModule;

export { EngagementModule } from './EngagementModule';
export type { IEngagementModule } from './IEngagementModule';
export type { DeleteCommentsByUser } from './deleteCommentsByUser/deleteCommentsByUser.dtos';
