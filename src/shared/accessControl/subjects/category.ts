import { CategoryPermissionModel } from '../entities/category';

export type CategorySubject = [
	'create' | 'delete' | 'list' | 'listWithAuthorship' | 'get' | 'getWithAuthorship' | 'update' | 'manage',
	'Category' | CategoryPermissionModel,
];
