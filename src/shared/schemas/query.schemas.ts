import { z } from 'zod/v4';
import { MAX_QUERY_LIMIT } from '@/shared/constants/query.constants';

export const searchTermSchema = z.string().max(64).optional();

export const limitSchema = z.coerce.number().int().min(1).max(MAX_QUERY_LIMIT).optional();

export const pageSchema = z.coerce.number().int().min(1).optional();

export const sortOrderSchema = z
	.union([
		z.enum(['asc', 'ascending', 'desc', 'descending']),
		z.coerce.number().refine((val) => val === 1 || val === -1, {
			message: 'Sort order as number must be -1 or 1',
		}),
	])
	.optional();
