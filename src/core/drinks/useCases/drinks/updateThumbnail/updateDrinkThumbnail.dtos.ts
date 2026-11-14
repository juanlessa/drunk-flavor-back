import { z } from 'zod/v4';
import { updateDrinkThumbnailSchema } from './updateDrinkThumbnail.schema';
import { Actor } from '@/shared/accessControl/actor.types';
import { FileStream } from '@/infrastructure/fastify/types/multipart.types';

export type UpdateDrinkThumbnailReqParam = z.infer<typeof updateDrinkThumbnailSchema>;

export type UpdateDrinkThumbnailCommand = {
	drinkId: string;
	fileStream: FileStream;
	mimetype: string;
	name: string;
	actor: Actor;
};
