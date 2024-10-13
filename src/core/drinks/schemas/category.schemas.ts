import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod';

// fields validation
export const categoryIdValidation = getObjectIdSchema({
	required: 'apiResponses.categories.requiredId',
	invalid: 'apiResponses.categories.invalidIdFormat',
});

export const categoryNameValidation = z
	.string({ required_error: 'apiResponses.categories.requiredName' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { message: 'apiResponses.categories.invalidNameFormat' satisfies LocaleKey })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

// schemas
export const categoryTranslationSchema = z.object({
	name: categoryNameValidation,
});
