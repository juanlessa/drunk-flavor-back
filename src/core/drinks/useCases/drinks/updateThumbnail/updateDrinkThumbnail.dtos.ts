import { z } from 'zod/v4';
import { updateDrinkThumbnailSchema } from './updateDrinkThumbnail.schema';
import { Actor } from '@/shared/accessControl/actor.types';
import { FileStream } from '@/infrastructure/fastify/types/multipart.types';

export type UpdateDrinkThumbnailReqParams = z.infer<typeof updateDrinkThumbnailSchema>;

export type UpdateDrinkThumbnailDTO = {
	drinkId: string;
	fileStream: FileStream;
	mimetype: string;
	name: string;
	actor: Actor;
};
