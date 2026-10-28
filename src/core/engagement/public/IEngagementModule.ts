export interface IEngagementModule {
	deleteCommentsByUser(userId: string): Promise<number>;
}
