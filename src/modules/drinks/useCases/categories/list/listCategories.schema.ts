import { categoryTranslationSchema } from '@/modules/drinks/schemas/category.schemas';
import { generateTranslationsFieldSchema } from '@/modules/drinks/schemas/helpers/translations.helpers';
import { sortOrderSchema, searchTermSchema } from '@/shared/schemas/query.schemas';
import { stringifiedJSONSchema } from '@/shared/schemas/stringified.schemas';
import { z } from 'zod';

const searchSchema = z.object({
	...generateTranslationsFieldSchema(categoryTranslationSchema, ['name'], searchTermSchema).shape,
});

const sortSchema = z.object({
	...generateTranslationsFieldSchema(categoryTranslationSchema, ['name'], sortOrderSchema).shape,
});

export const listCategoryQuerySchema = z.object({
	limit: z.coerce.number().optional(),
	page: z.coerce.number().optional(),
	search: stringifiedJSONSchema(searchSchema).optional(),
	sort: stringifiedJSONSchema(sortSchema).optional(),
});
