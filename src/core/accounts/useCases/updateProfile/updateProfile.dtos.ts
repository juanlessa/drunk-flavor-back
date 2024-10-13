import { z } from 'zod';
import { updateProfileSchema } from './updateProfile.schema';

export type UpdateUserProfileReqBody = z.infer<typeof updateProfileSchema>;

export type UpdateProfile = {
	id: string;
	name: string;
	surname: string;
};
