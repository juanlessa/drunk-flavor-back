import { z } from 'zod/v4';
import { UnitData } from '@/core/drinks/dtos/unit.dtos';
import { Actor } from '@/shared/accessControl/actor.types';
import { createUnitSchema } from './createUnit.schema';

export type CreateUnitReqBody = z.infer<typeof createUnitSchema>;
export type CreateUnitCommand = UnitData & { actor: Actor };
