import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';

// Fields validation
export const ingredientIdValidation = getObjectIdSchema({
	required: 'apiResponses.ingredients.requiredId',
	invalid: 'apiResponses.ingredients.invalidIdFormat',
});

export const ingredientNameValidation = z
	.string({ error: 'apiResponses.ingredients.requiredName' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { error: 'apiResponses.ingredients.invalidNameFormat' satisfies LocaleKey })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const ingredientUnitValidation = z
	.string({ error: 'apiResponses.ingredients.requiredUnit' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { error: 'apiResponses.ingredients.invalidUnitFormat' satisfies LocaleKey });

export const ingredientUnitPluralValidation = z
	.string({ error: 'apiResponses.ingredients.requiredUnitPlural' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { error: 'apiResponses.ingredients.invalidUnitPluralFormat' satisfies LocaleKey });

export const ingredientIsAlcoholicValidation = z.boolean({
	error: 'apiResponses.ingredients.requiredIsAlcoholic' satisfies LocaleKey,
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
