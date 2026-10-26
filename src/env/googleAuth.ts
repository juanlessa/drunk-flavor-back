import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

const GOOGLE_CLIENT_ID_DEFAULT = 'test-google-client-id.apps.googleusercontent.com';

// GOOGLE_CLIENT_ID is the OAuth 2.0 client ID used as the expected audience when
// verifying Google ID tokens. It must be a real, non-empty value in production
// and development; testing/e2e default to a fixed placeholder because those
// environments never perform a real Google token verification (the verifier is
// faked — see src/shared/providers/googleAuth/index.ts).
const googleClientIdEnvMap = {
	production: z.string().min(1, { message: 'GOOGLE_CLIENT_ID must be set in production' }),
	development: z.string().min(1, { message: 'GOOGLE_CLIENT_ID must be set in development' }),
	testing: z.string().min(1).default(GOOGLE_CLIENT_ID_DEFAULT),
	e2e: z.string().min(1).default(GOOGLE_CLIENT_ID_DEFAULT),
} satisfies Record<NodeEnv, z.ZodType<string>>;

export const buildGoogleAuthSchema = (nodeEnv: NodeEnv) =>
	z.object({
		GOOGLE_CLIENT_ID: googleClientIdEnvMap[nodeEnv],
	});

export type GoogleAuthSchema = z.infer<ReturnType<typeof buildGoogleAuthSchema>>;

export const parseGoogleAuthEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): GoogleAuthSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildGoogleAuthSchema(resolvedNodeEnv).parse(source);
};
