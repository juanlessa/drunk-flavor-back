import { z } from 'zod';
import { updateDrinkCoverSchema } from './updateDrinkCover.schema';
import { FileStream } from '@/infrastructure/fastify/types/multipart,types';

export type UpdateDrinkCoverReqParams = z.infer<typeof updateDrinkCoverSchema>;

export type UpdateDrinkCoverDTO = {
	drinkId: string;
	fileStream: FileStream;
	mimetype: string;
	name: string;
};
