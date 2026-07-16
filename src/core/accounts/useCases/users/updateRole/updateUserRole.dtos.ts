import { z } from 'zod/v4';
import { updateUserRoleSchema } from './updateUserRole.schema';
import { UserRole } from '@/core/accounts/entities/user.entity';

export type UpdateUserRoleReqBody = z.infer<typeof updateUserRoleSchema>;

export type UpdateUserRole = {
	user_id: string;
	role: UserRole;
};
