import { CategoryPermissionModel } from '../entities/category';

export type CategorySubject = [
	'create' | 'delete' | 'list' | 'get' | 'update' | 'manage',
	'Category' | CategoryPermissionModel,
];
