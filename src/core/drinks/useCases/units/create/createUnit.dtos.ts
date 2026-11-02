import { z } from 'zod/v4';
import { CreateUnit } from '@/core/drinks/dtos/unit.dtos';
import { createUnitSchema } from './createUnit.schema';

export type CreateUnitReqBody = z.infer<typeof createUnitSchema>;
export type CreateUnitDTO = CreateUnit;
