import { z } from 'zod';
import { createUserSchema } from './createUser.schema';

export type CreateUserReqBody = z.infer<typeof createUserSchema>;
