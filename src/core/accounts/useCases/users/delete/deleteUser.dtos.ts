import { z } from 'zod/v4';
import { deleteUserSchema } from './deleteUser.schema';
import { Actor } from '@/shared/accessControl/actor.types';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';

export type DeleteUserReqBody = z.infer<typeof deleteUserSchema>;

export type DeleteUser = {
	id: string;
	actor: Actor;
	administrativeContext?: AdministrativeEventContext;
};
