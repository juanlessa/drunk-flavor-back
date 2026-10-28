import { z } from 'zod/v4';
import { userAdministrationReasonValidation, userIdValidation } from '@/core/accounts/schemas/user.schemas';

export const suspendUserParamsSchema = z.object({ id: userIdValidation });
export const suspendUserBodySchema = z.object({ reason: userAdministrationReasonValidation });
