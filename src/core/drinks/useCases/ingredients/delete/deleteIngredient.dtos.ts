import { z } from 'zod/v4';
import { Actor } from '@/shared/accessControl/actor.types';
import { deleteIngredientSchema } from './deleteIngredient.schema';

export type DeleteIngredientReqBody = z.infer<typeof deleteIngredientSchema>;
export type DeleteIngredientCommand = {
	id: string;
	actor: Actor;
};
