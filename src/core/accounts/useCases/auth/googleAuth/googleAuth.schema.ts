import { z } from 'zod/v4';

/** Authorization code returned by the Google popup (GIS code model), exchanged on the server. */
export const googleAuthSchema = z.object({
	code: z.string().min(1, { message: 'apiResponses.auth.googleCodeRequired' }),
});
