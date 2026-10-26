import { CommentPermissionModel } from '../entities/comment';

export type CommentSubject = [
	'create' | 'delete' | 'list' | 'get' | 'update' | 'moderate' | 'manage',
	'Comment' | CommentPermissionModel,
];
