import { DrinkPermissionModel } from '../entities/drink';

export type DrinkSubject = [
	'create' | 'delete' | 'list' | 'listWithAuthorship' | 'get' | 'getWithAuthorship' | 'update' | 'manage',
	'Drink' | DrinkPermissionModel,
];
