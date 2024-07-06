import { z } from 'zod';
import { updateUserRoleSchema } from './updateUserRole.schema';
import { UserRole } from '@/modules/accounts/entities/user.entity';

export type UpdateUserRoleReqBody = z.infer<typeof updateUserRoleSchema>;

export type UpdateUserRole = {
	user_id: string;
	role: UserRole;
};
