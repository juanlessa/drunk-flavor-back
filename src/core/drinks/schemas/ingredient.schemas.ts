import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod';

// Fields validation
export const ingredientIdValidation = getObjectIdSchema({
	required: 'apiResponses.ingredients.requiredId',
	invalid: 'apiResponses.ingredients.invalidIdFormat',
});

export const ingredientNameValidation = z
	.string({ required_error: 'apiResponses.ingredients.requiredName' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { message: 'apiResponses.ingredients.invalidNameFormat' satisfies LocaleKey })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const ingredientUnitValidation = z
	.string({ required_error: 'apiResponses.ingredients.requiredUnit' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { message: 'apiResponses.ingredients.invalidUnitFormat' satisfies LocaleKey });

export const ingredientUnitPluralValidation = z
	.string({ required_error: 'apiResponses.ingredients.requiredUnitPlural' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { message: 'apiResponses.ingredients.invalidUnitPluralFormat' satisfies LocaleKey });

export const ingredientIsAlcoholicValidation = z.boolean({
	required_error: 'apiResponses.ingredients.requiredIsAlcoholic' satisfies LocaleKey,
});

export const ingredientCategoryIdValidation = getObjectIdSchema({
	required: 'apiResponses.ingredients.requiredCategory',
	invalid: 'apiResponses.ingredients.invalidCategoryFormat',
});

// schemas
export const ingredientTranslationSchema = z.object({
	name: ingredientNameValidation,
	unit: ingredientUnitValidation,
	unit_plural: ingredientUnitPluralValidation,
});
