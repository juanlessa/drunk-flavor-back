import { IngredientPermissionModel } from '../entities/ingredient';

export type IngredientSubject = [
	'create' | 'delete' | 'list' | 'listWithAuthorship' | 'get' | 'getWithAuthorship' | 'update' | 'manage',
	'Ingredient' | IngredientPermissionModel,
];
