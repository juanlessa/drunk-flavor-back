import { EngagementModule } from './EngagementModule';
import { IEngagementModule } from './IEngagementModule';
import { resolveDeleteCommentsByUserService } from './deleteCommentsByUser/deleteCommentsByUser.container';
import { resolveDeleteEngagementByDrinkService } from './deleteEngagementByDrink/deleteEngagementByDrink.container';

const deleteCommentsByUserService = resolveDeleteCommentsByUserService();
const deleteEngagementByDrinkService = resolveDeleteEngagementByDrinkService();

const engagementModule: IEngagementModule = new EngagementModule(
	deleteCommentsByUserService,
	deleteEngagementByDrinkService,
);

export const resolveEngagementModule = (): IEngagementModule => engagementModule;
export { EngagementModule } from './EngagementModule';
export type { IEngagementModule } from './IEngagementModule';
export type { DeleteCommentsByUser } from './deleteCommentsByUser/deleteCommentsByUser.dtos';
export type {
	DeleteEngagementByDrink,
	DeleteEngagementByDrinkResult,
} from './deleteEngagementByDrink/deleteEngagementByDrink.dtos';
