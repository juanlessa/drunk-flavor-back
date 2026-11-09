import { DrinkPermissionModel } from '../entities/drink';

export type DrinkSubject = [
	'create' | 'delete' | 'list' | 'listWithAuthorship' | 'get' | 'update' | 'manage',
	'Drink' | DrinkPermissionModel,
];
