import { z } from 'zod/v4';
import { userAdministrationReasonValidation, userIdValidation } from '@/core/accounts/schemas/user.schemas';

export const closeUserParamsSchema = z.object({ id: userIdValidation });
export const closeUserBodySchema = z.object({ reason: userAdministrationReasonValidation });
