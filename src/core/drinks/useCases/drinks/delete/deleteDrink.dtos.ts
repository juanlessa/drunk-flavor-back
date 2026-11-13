import { z } from 'zod/v4';
import { Actor } from '@/shared/accessControl/actor.types';
import { deleteDrinkSchema } from './deleteDrink.schema';

export type DeleteDrinkReqBody = z.infer<typeof deleteDrinkSchema>;
export type DeleteDrinkCommand = {
	id: string;
	actor: Actor;
};
