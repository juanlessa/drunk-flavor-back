import { z } from 'zod/v4';

export const dependencyStatusSchema = z.enum(['up', 'down']);

export const readinessResponseSchema = z.object({
	status: z.enum(['ok', 'error']),
	dependencies: z.object({
		mongo: dependencyStatusSchema,
		redis: dependencyStatusSchema,
		bullmq: dependencyStatusSchema,
	}),
});

export const livenessResponseSchema = z.object({
	status: z.literal('ok'),
});

export type ReadinessReport = z.infer<typeof readinessResponseSchema>;
