import { z } from 'zod/v4';
import { LocaleKey } from '@/shared/types/locale.types';
import { env } from '@/env';

// fields validation
export const tokenValidation = z
	.string({ error: 'apiResponses.auth.requiredToken' satisfies LocaleKey })
	.length(env.USER_TOKEN_SIZE, { error: 'apiResponses.auth.invalidTokenFormat' satisfies LocaleKey });
