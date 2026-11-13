import { DeleteCommentsByUser } from './deleteCommentsByUser/deleteCommentsByUser.dtos';

export interface IEngagementModule {
	/** Deletes every comment written by the user; returns how many were removed. */
	deleteCommentsByUser(data: DeleteCommentsByUser): Promise<number>;
}
