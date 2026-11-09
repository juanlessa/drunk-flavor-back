import { z } from 'zod/v4';
import { updateDrinkCoverSchema } from './updateDrinkCover.schema';
import { Actor } from '@/shared/accessControl/actor.types';
import { FileStream } from '@/infrastructure/fastify/types/multipart.types';

export type UpdateDrinkCoverReqParams = z.infer<typeof updateDrinkCoverSchema>;

export type UpdateDrinkCoverDTO = {
	drinkId: string;
	fileStream: FileStream;
	mimetype: string;
	name: string;
	actor: Actor;
};
