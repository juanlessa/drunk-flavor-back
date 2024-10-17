import { z } from 'zod';
import { loginSchema } from './login.schema';

export type LoginReqBody = z.infer<typeof loginSchema>;

export type Login = {
	email: string;
	password: string;
};
