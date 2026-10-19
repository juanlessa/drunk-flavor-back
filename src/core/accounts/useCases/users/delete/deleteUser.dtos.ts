import { z } from 'zod/v4';
import { deleteUserSchema } from './deleteUser.schema';

export type DeleteUserReqBody = z.infer<typeof deleteUserSchema>;

export type DeleteUser = {
	id: string;
};
