import { z } from 'zod/v4';
import { LocaleKey } from '@/shared/types/locale.types';

export const reauthenticatePasswordSchema = z.object({
	password: z
		.string({ error: 'apiResponses.users.requiredPassword' satisfies LocaleKey })
		.min(1, { error: 'apiResponses.users.requiredPassword' satisfies LocaleKey })
		.max(64, { error: 'apiResponses.users.invalidPasswordMaxSize' satisfies LocaleKey }),
});
