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

export const ingredientIsAlcoholicValidation = z.boolean({
	error: 'apiResponses.ingredients.requiredIsAlcoholic' satisfies LocaleKey,
});

export const ingredientCategoryIdValidation = getObjectIdSchema({
	required: 'apiResponses.ingredients.requiredCategory',
	invalid: 'apiResponses.ingredients.invalidCategoryFormat',
});

export const ingredientUnitIdValidation = getObjectIdSchema({
	required: 'apiResponses.ingredients.requiredUnit',
	invalid: 'apiResponses.ingredients.invalidUnitFormat',
});

// schemas
export const ingredientTranslationSchema = z.object({
	name: ingredientNameValidation,
});
