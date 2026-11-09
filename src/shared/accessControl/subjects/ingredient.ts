import { IngredientPermissionModel } from '../entities/ingredient';

export type IngredientSubject = [
	'create' | 'delete' | 'list' | 'listWithAuthorship' | 'get' | 'update' | 'manage',
	'Ingredient' | IngredientPermissionModel,
];
