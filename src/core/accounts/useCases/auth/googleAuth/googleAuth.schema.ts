import { z } from 'zod/v4';

export const googleAuthSchema = z.object({
	idToken: z.string().min(1, { message: 'apiResponses.auth.googleTokenRequired' }),
});
