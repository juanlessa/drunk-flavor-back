import { z } from 'zod';
import { updateDrinkThumbnailSchema } from './updateDrinkThumbnail.schema';
import { FileStream } from '@/infrastructure/fastify/types/multipart,types';

export type UpdateDrinkThumbnailReqParams = z.infer<typeof updateDrinkThumbnailSchema>;

export type UpdateDrinkThumbnailDTO = {
	drinkId: string;
	fileStream: FileStream;
	mimetype: string;
	name: string;
};
