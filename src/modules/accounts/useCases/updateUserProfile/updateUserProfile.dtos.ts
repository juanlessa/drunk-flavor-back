import { z } from 'zod';
import { updateUserSchema } from './updateUserProfile.schema';

export type UpdateUserReqBody = z.infer<typeof updateUserSchema>;

export type UpdateUserProfile = {
	id: string;
	name: string;
	surname: string;
	email: string;
	password: string;
};
