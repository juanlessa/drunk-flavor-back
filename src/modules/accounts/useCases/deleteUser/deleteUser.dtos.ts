import { z } from 'zod';
import { deleteUserSchema } from './deleteUser.schema';

export type deleteUserReqBody = z.infer<typeof deleteUserSchema>;
