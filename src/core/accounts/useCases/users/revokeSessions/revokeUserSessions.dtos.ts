import { z } from 'zod/v4';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';
import { Actor } from '@/shared/accessControl/actor.types';
import { revokeUserSessionsBodySchema, revokeUserSessionsParamsSchema } from './revokeUserSessions.schema';

export type RevokeUserSessionsReqParams = z.infer<typeof revokeUserSessionsParamsSchema>;
export type RevokeUserSessionsReqBody = z.infer<typeof revokeUserSessionsBodySchema>;

export type RevokeUserSessionsActor = Actor & { sessionVersion: number };

export type RevokeUserSessions = {
	id: string;
	reason: string;
	actor: RevokeUserSessionsActor;
	administrativeContext?: AdministrativeEventContext;
};
