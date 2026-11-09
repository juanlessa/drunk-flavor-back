import { CategoryPermissionModel } from '../entities/category';

export type CategorySubject = [
	'create' | 'delete' | 'list' | 'listWithAuthorship' | 'get' | 'update' | 'manage',
	'Category' | CategoryPermissionModel,
];
