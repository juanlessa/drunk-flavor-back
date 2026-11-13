import { DeleteCommentsByUser } from './deleteCommentsByUser/deleteCommentsByUser.dtos';
import {
	DeleteEngagementByDrink,
	DeleteEngagementByDrinkResult,
} from './deleteEngagementByDrink/deleteEngagementByDrink.dtos';

export interface IEngagementModule {
	/** Deletes every comment written by the user; returns how many were removed. */
	deleteCommentsByUser(data: DeleteCommentsByUser): Promise<number>;
	/** Deletes every comment and rating of the drink; returns how many of each were removed. */
	deleteEngagementByDrink(data: DeleteEngagementByDrink): Promise<DeleteEngagementByDrinkResult>;
}
