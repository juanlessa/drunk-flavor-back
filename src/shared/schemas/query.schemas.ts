import { z } from 'zod';

export const searchTermSchema = z.string().optional();

export const sortOrderSchema = z
	.union([
		z.enum(['asc', 'ascending', 'desc', 'descending']),
		z.coerce.number().refine((val) => val === 1 || val === -1, {
			message: 'Sort order as number must be -1 or 1',
		}),
	])
	.optional();
