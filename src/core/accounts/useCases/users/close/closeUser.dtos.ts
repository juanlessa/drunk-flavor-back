import { z } from 'zod/v4';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';
import { Actor } from '@/shared/accessControl/actor.types';
import { closeUserBodySchema, closeUserParamsSchema } from './closeUser.schema';

export type CloseUserReqParams = z.infer<typeof closeUserParamsSchema>;
export type CloseUserReqBody = z.infer<typeof closeUserBodySchema>;

export type CloseUser = {
	id: string;
	reason: string;
	actor: Actor;
	administrativeContext?: AdministrativeEventContext;
};
