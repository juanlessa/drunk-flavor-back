import { z } from 'zod/v4';
import { userAdministrationReasonValidation, userIdValidation } from '@/core/accounts/schemas/user.schemas';

export const revokeUserSessionsParamsSchema = z.object({ id: userIdValidation });
export const revokeUserSessionsBodySchema = z.object({ reason: userAdministrationReasonValidation });
