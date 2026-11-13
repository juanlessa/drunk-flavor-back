import { EngagementModule } from './EngagementModule';
import { IEngagementModule } from './IEngagementModule';
import { resolveDeleteCommentsByUserService } from './deleteCommentsByUser/deleteCommentsByUser.container';
import { resolveDeleteFavoritesByUserService } from './deleteFavoritesByUser/deleteFavoritesByUser.container';
import { resolveDeleteEngagementByDrinkService } from './deleteEngagementByDrink/deleteEngagementByDrink.container';

const deleteCommentsByUserService = resolveDeleteCommentsByUserService();
const deleteFavoritesByUserService = resolveDeleteFavoritesByUserService();
const deleteEngagementByDrinkService = resolveDeleteEngagementByDrinkService();

const engagementModule: IEngagementModule = new EngagementModule(
	deleteCommentsByUserService,
	deleteFavoritesByUserService,
	deleteEngagementByDrinkService,
);

export const resolveEngagementModule = (): IEngagementModule => engagementModule;
export { EngagementModule } from './EngagementModule';
export type { IEngagementModule } from './IEngagementModule';
export type { DeleteCommentsByUser } from './deleteCommentsByUser/deleteCommentsByUser.dtos';
export type { DeleteFavoritesByUser } from './deleteFavoritesByUser/deleteFavoritesByUser.dtos';
export type {
	DeleteEngagementByDrink,
	DeleteEngagementByDrinkResult,
} from './deleteEngagementByDrink/deleteEngagementByDrink.dtos';
