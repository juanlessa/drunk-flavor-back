import { z } from 'zod';
import { deleteUserSchema } from './deleteUser.schema';

export type DeleteUserReqBody = z.infer<typeof deleteUserSchema>;

export type DeleteUser = {
	id: string;
};
