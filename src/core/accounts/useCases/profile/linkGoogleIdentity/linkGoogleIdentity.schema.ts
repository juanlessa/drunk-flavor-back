import { z } from 'zod/v4';
import { googleAuthSchema } from '@/core/accounts/useCases/auth/googleAuth/googleAuth.schema';
import { LocaleKey } from '@/shared/types/locale.types';

export const linkGoogleIdentitySchema = googleAuthSchema.extend({
	currentPassword: z
		.string()
		.min(1, 'apiResponses.users.requiredPassword' satisfies LocaleKey)
		.max(64, 'apiResponses.users.invalidPasswordMaxSize' satisfies LocaleKey),
});
