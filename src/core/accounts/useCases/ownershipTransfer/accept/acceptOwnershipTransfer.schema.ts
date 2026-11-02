import { z } from 'zod/v4';
import { LocaleKey } from '@/shared/types/locale.types';

export const acceptOwnershipTransferSchema = z.object({
	token: z
		.string({ error: 'apiResponses.auth.requiredToken' satisfies LocaleKey })
		.trim()
		.min(1, { error: 'apiResponses.auth.requiredToken' satisfies LocaleKey }),
});
