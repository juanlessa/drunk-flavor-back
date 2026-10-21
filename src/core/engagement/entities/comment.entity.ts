import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';

export const CommentStatuses = {
	visible: 'visible',
	hidden: 'hidden',
	flagged: 'flagged',
} as const;

export type CommentStatus = (typeof CommentStatuses)[keyof typeof CommentStatuses];

export type Comment = DatabaseCommonInfo & {
	drink_id: string;
	user_id: string;
	content: string;
	status: CommentStatus;
};
