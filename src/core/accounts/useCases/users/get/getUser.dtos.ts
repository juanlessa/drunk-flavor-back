import { z } from 'zod/v4';
import { getUserSchema } from './getUser.schema';
import { Actor } from '@/shared/accessControl/actor.types';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';

export type GetUserSchemaReqParam = z.infer<typeof getUserSchema>;

export type GetUserCommand = {
	id: string;
	actor: Actor;
	administrativeContext?: AdministrativeEventContext;
};
