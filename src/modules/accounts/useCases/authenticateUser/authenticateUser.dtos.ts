import { z } from 'zod';
import { authenticateUserSchema } from './authenticateUser.schema';

export type AuthenticateUserReqBody = z.infer<typeof authenticateUserSchema>;

export type AuthenticateUser = {
	email: string;
	password: string;
};
