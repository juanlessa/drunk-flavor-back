import { z } from 'zod/v4';
import { loginSchema } from './login.schema';

export type LoginReqBody = z.infer<typeof loginSchema>;

export type Login = {
	email: string;
	password: string;
};
