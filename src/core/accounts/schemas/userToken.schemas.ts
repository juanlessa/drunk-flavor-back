import { z } from 'zod';
import { LocaleKey } from '@/shared/types/locale.types';
import { env } from '@/env';

// fields validation
export const tokenValidation = z
	.string({ required_error: 'apiResponses.auth.requiredToken' satisfies LocaleKey })
	.length(env.USER_TOKEN_SIZE, { message: 'apiResponses.auth.invalidTokenFormat' satisfies LocaleKey });
