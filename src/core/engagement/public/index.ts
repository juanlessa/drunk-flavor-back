import { resolveCommentsRepository } from '@/core/engagement/infra/mongo/container';
import { EngagementModule } from './EngagementModule';
import { IEngagementModule } from './IEngagementModule';

const engagementModule: IEngagementModule = new EngagementModule(resolveCommentsRepository());

export const resolveEngagementModule = (): IEngagementModule => engagementModule;

export { EngagementModule } from './EngagementModule';
export type { IEngagementModule } from './IEngagementModule';
