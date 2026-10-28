import { EntityMetadata } from '@/shared/types/entity.types';

export const CommentStatuses = {
	visible: 'visible',
	hidden: 'hidden',
	flagged: 'flagged',
} as const;

export type CommentStatus = (typeof CommentStatuses)[keyof typeof CommentStatuses];

export type Comment = EntityMetadata & {
	drinkId: string;
	userId: string;
	content: string;
	status: CommentStatus;
};
