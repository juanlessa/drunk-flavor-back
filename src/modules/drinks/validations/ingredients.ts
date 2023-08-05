import { z } from 'zod';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredientErrors';

// fields validation
const idValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_id })
	.length(24, { message: INGREDIENT_ERRORS.invalid_id_format });

const nameValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_name })
	.trim()
	.toLowerCase()
	.min(1, { message: INGREDIENT_ERRORS.invalid_name_format })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

const unitySingularValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_unitySingular })
	.trim()
	.toLowerCase()
	.min(1, { message: INGREDIENT_ERRORS.invalid_unitySingular_format });

const unityPluralValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_unityPlural })
	.trim()
	.toLowerCase()
	.min(1, { message: INGREDIENT_ERRORS.invalid_unityPlural_format });

const categoryIdValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_categoryId })
	.length(24, { message: INGREDIENT_ERRORS.invalid_categoryId_format });

const isAlcoholicValidation = z.boolean({ required_error: INGREDIENT_ERRORS.required_is_alcoholic });

// schemas
const createIngredientSchema = z.object({
	name: nameValidation,
	categoryId: categoryIdValidation,
	unitySingular: unitySingularValidation,
	unityPlural: unityPluralValidation,
	isAlcoholic: isAlcoholicValidation
});

const deleteIngredientSchema = z.object({
	id: idValidation
});

const updateIngredientSchema = z.object({
	id: idValidation,
	name: nameValidation,
	categoryId: categoryIdValidation,
	unitySingular: unitySingularValidation,
	unityPlural: unityPluralValidation,
	isAlcoholic: isAlcoholicValidation
});

const getIngredientSchema = z.object({
	id: idValidation
});

export { createIngredientSchema, deleteIngredientSchema, updateIngredientSchema, getIngredientSchema };
