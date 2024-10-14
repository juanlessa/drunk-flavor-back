import { sortOrderSchema, searchTermSchema } from '@/shared/schemas/query.schemas';
import { stringifiedJSONSchema } from '@/shared/schemas/stringified.schemas';
import { z } from 'zod';

const searchSchema = z.object({
	email: searchTermSchema,
});

const sortSchema = z.object({
	email: sortOrderSchema,
});

export const listUsersQuerySchema = z.object({
	limit: z.coerce.number().optional(),
	page: z.coerce.number().optional(),
	search: stringifiedJSONSchema(searchSchema).optional(),
	sort: stringifiedJSONSchema(sortSchema).optional(),
});
