import { z } from 'zod';
import { signupSchema } from './signup.schema';

export type CreateUserReqBody = z.infer<typeof signupSchema>;

export type Signup = {
	name: string;
	surname: string;
	email: string;
	password: string;
};
