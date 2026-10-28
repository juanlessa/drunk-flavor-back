import { z } from 'zod/v4';
import { userAdministrationReasonValidation, userIdValidation } from '@/core/accounts/schemas/user.schemas';

export const requestOwnershipTransferSchema = z.object({
	targetUserId: userIdValidation,
	reason: userAdministrationReasonValidation,
});
