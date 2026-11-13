import './loadEnv';
import { z } from 'zod/v4';

/**
 * Worker process settings. Kept apart from the connection settings so only the
 * worker process reads them, and so they stay engine-agnostic.
 */
export const workerSchema = z.object({
	EMAIL_WORKER_CONCURRENCY: z.coerce.number().int().min(1).default(5),
});

export type WorkerSchema = z.infer<typeof workerSchema>;

export const parseWorkerEnv = (source: NodeJS.ProcessEnv = process.env): WorkerSchema => workerSchema.parse(source);
