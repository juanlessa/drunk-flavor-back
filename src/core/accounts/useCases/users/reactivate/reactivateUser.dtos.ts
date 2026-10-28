import { z } from 'zod/v4';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';
import { Actor } from '@/shared/accessControl/actor.types';
import { reactivateUserBodySchema, reactivateUserParamsSchema } from './reactivateUser.schema';

export type ReactivateUserReqParams = z.infer<typeof reactivateUserParamsSchema>;
export type ReactivateUserReqBody = z.infer<typeof reactivateUserBodySchema>;

export type ReactivateUser = {
	id: string;
	reason: string;
	actor: Actor;
	administrativeContext?: AdministrativeEventContext;
};
