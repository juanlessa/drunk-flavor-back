import { z } from 'zod/v4';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';
import { Actor } from '@/shared/accessControl/actor.types';
import { suspendUserBodySchema, suspendUserParamsSchema } from './suspendUser.schema';

export type SuspendUserReqParam = z.infer<typeof suspendUserParamsSchema>;
export type SuspendUserReqBody = z.infer<typeof suspendUserBodySchema>;

export type SuspendUserCommand = {
	id: string;
	reason: string;
	actor: Actor;
	administrativeContext?: AdministrativeEventContext;
};
