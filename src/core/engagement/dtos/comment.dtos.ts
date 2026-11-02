import { Comment, CommentStatus } from '@/core/engagement/entities/comment.entity';

export type CreateComment = {
	drinkId: string;
	userId: string;
	content: string;
};

export type UpdateComment = {
	id: string;
	content: string;
};

export type UpdateCommentStatus = {
	id: string;
	status: CommentStatus;
};

export type CommentSortField = 'createdAt' | 'updatedAt' | 'id';

export type CommentListQuery = {
	page: number;
	limit: number;
	sort: Readonly<Partial<Record<CommentSortField, 1 | -1>>>;
};

/** Public identity of a comment's author; `null` when the account no longer exists. */
export type CommentAuthor = {
	id: string;
	name?: string;
	surname?: string;
	avatarUrl?: string;
};

export type CommentWithAuthor = Comment & {
	author: CommentAuthor | null;
};

export type CommentVisibilityFilter = Readonly<{
	status?: Comment['status'];
}>;
