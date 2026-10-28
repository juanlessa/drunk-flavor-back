import { generateTranslationsFieldSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import { unitTranslationSchema } from '@/core/drinks/schemas/unit.schemas';
import { limitSchema, pageSchema, searchTermSchema, sortOrderSchema } from '@/shared/schemas/query.schemas';
import { stringifiedJSONSchema } from '@/shared/schemas/stringified.schemas';
import { z } from 'zod/v4';

const searchSchema = z.object({
	...generateTranslationsFieldSchema(unitTranslationSchema, ['name', 'namePlural'], searchTermSchema).shape,
});
const sortSchema = z.object({
	...generateTranslationsFieldSchema(unitTranslationSchema, ['name', 'namePlural'], sortOrderSchema).shape,
});

export const listUnitsQuerySchema = z.object({
	limit: limitSchema,
	page: pageSchema,
	search: stringifiedJSONSchema(searchSchema).optional(),
	sort: stringifiedJSONSchema(sortSchema).optional(),
});
