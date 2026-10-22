import { RatingPermissionModel } from '../entities/rating';

export type RatingSubject = [
	'create' | 'delete' | 'list' | 'get' | 'update' | 'manage',
	'Rating' | RatingPermissionModel,
];
