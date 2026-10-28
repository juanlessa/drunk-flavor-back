import { z } from 'zod/v4';
import { updateUserRoleSchema } from './updateUserRole.schema';
import { Role } from '@/shared/accessControl/roles';
import { Actor } from '@/shared/accessControl/actor.types';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';

export type UpdateUserRoleReqBody = z.infer<typeof updateUserRoleSchema>;

export type UpdateUserRole = {
	userId: string;
	role: Role;
	actor: Actor;
	administrativeContext?: AdministrativeEventContext;
};
