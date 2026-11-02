export type FindPublicProfilesByIds = {
	userIds: string[];
};

/** Identity fields that are safe to show next to user-generated content. */
export type PublicProfile = {
	id: string;
	name?: string;
	surname?: string;
	avatarUrl?: string;
};
