import { z } from 'zod/v4';
import { DeleteDrink } from '@/core/drinks/dtos/drink.dtos';
import { Actor } from '@/shared/accessControl/actor.types';
import { deleteDrinkSchema } from './deleteDrink.schema';

export type DeleteDrinkReqBody = z.infer<typeof deleteDrinkSchema>;
export type DeleteDrinkDTO = DeleteDrink & { actor: Actor };
