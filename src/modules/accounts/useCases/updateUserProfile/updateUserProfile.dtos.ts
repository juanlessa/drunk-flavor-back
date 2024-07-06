import { z } from 'zod';
import { updateUserProfileSchema } from './updateUserProfile.schema';

export type UpdateUserProfileReqBody = z.infer<typeof updateUserProfileSchema>;

export type UpdateUserProfile = {
	id: string;
	name: string;
	surname: string;
	email: string;
	password: string;
};
