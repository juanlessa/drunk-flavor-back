import { z } from 'zod/v4';
import { Actor } from '@/shared/accessControl/actor.types';
import { deleteUnitSchema } from './deleteUnit.schema';

export type DeleteUnitReqBody = z.infer<typeof deleteUnitSchema>;
export type DeleteUnitCommand = {
	id: string;
	actor: Actor;
};
