import { IngredientPermissionModel } from '../entities/ingredient';

export type IngredientSubject = [
	'create' | 'delete' | 'list' | 'get' | 'update' | 'manage',
	'Ingredient' | IngredientPermissionModel,
];
