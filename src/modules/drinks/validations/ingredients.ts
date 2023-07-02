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

const categoryValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_category })
	.trim()
	.toLowerCase()
	.min(1, { message: INGREDIENT_ERRORS.invalid_category_format });

const unityValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_unity })
	.trim()
	.toLowerCase()
	.min(1, { message: INGREDIENT_ERRORS.invalid_unity_format });

const colorThemeValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_color_theme })
	.trim()
	.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: INGREDIENT_ERRORS.invalid_color_theme_format });

const isAlcoholicValidation = z.boolean({ required_error: INGREDIENT_ERRORS.required_is_alcoholic });

// schemas
const createIngredientSchema = z.object({
	name: nameValidation,
	category: categoryValidation,
	unity: unityValidation,
	colorTheme: colorThemeValidation,
	isAlcoholic: isAlcoholicValidation
});

const deleteIngredientSchema = z.object({
	id: idValidation
});

const updateIngredientSchema = z.object({
	id: idValidation,
	category: categoryValidation,
	name: nameValidation,
	unity: unityValidation,
	colorTheme: colorThemeValidation,
	isAlcoholic: isAlcoholicValidation
});

const getIngredientSchema = z.object({
	id: idValidation
});

export { createIngredientSchema, deleteIngredientSchema, updateIngredientSchema, getIngredientSchema };
