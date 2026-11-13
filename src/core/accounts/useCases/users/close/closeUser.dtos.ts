import { z } from 'zod/v4';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';
import { Actor } from '@/shared/accessControl/actor.types';
import { closeUserBodySchema, closeUserParamsSchema } from './closeUser.schema';

export type CloseUserReqParam = z.infer<typeof closeUserParamsSchema>;
export type CloseUserReqBody = z.infer<typeof closeUserBodySchema>;

export type CloseUserCommand = {
	id: string;
	reason: string;
	actor: Actor;
	administrativeContext?: AdministrativeEventContext;
};
