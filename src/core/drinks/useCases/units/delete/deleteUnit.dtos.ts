import { z } from 'zod/v4';
import { DeleteUnit } from '@/core/drinks/dtos/unit.dtos';
import { Actor } from '@/shared/accessControl/actor.types';
import { deleteUnitSchema } from './deleteUnit.schema';

export type DeleteUnitReqBody = z.infer<typeof deleteUnitSchema>;
export type DeleteUnitDTO = DeleteUnit & { actor: Actor };
