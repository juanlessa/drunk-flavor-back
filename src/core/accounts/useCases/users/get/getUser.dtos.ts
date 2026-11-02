import { z } from 'zod/v4';
import { getUserSchema } from './getUser.schema';
import { Actor } from '@/shared/accessControl/actor.types';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';

export type GetUserSchemaReqParams = z.infer<typeof getUserSchema>;

export type GetUser = {
	id: string;
	actor: Actor;
	administrativeContext?: AdministrativeEventContext;
};
