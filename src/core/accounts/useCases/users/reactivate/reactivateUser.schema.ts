import { z } from 'zod/v4';
import { userAdministrationReasonValidation, userIdValidation } from '@/core/accounts/schemas/user.schemas';

export const reactivateUserParamsSchema = z.object({ id: userIdValidation });
export const reactivateUserBodySchema = z.object({ reason: userAdministrationReasonValidation });
