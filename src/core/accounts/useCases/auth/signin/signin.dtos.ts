import { z } from 'zod/v4';
import { signinSchema } from './signin.schema';

export type SigninReqBody = z.infer<typeof signinSchema>;

export type SigninCommand = {
	email: string;
	password: string;
};
