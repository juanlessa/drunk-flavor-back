import { z } from 'zod/v4';
import { updateUserRoleSchema } from './updateUserRole.schema';
import { Role } from '@/shared/accessControl/roles';

export type UpdateUserRoleReqBody = z.infer<typeof updateUserRoleSchema>;

export type UpdateUserRole = {
	user_id: string;
	role: Role;
};
