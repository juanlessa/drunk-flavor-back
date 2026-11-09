import { z } from 'zod/v4';
import { DeleteIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { Actor } from '@/shared/accessControl/actor.types';
import { deleteIngredientSchema } from './deleteIngredient.schema';

export type DeleteIngredientReqBody = z.infer<typeof deleteIngredientSchema>;
export type DeleteIngredientDTO = DeleteIngredient & { actor: Actor };
