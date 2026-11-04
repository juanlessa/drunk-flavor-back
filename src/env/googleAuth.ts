import './loadEnv';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

const GOOGLE_CLIENT_ID_DEFAULT = 'test-google-client-id.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET_DEFAULT = 'test-google-client-secret';

// GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are the credentials of the OAuth 2.0
// web client. The secret is used to exchange the authorization code returned by
// the Google popup, and the client ID is the expected audience of the ID token
// returned by that exchange. Both must be real, non-empty values in production
// and development; testing/e2e default to fixed placeholders because those
// environments never talk to Google (the identity provider is faked — see
// src/shared/providers/googleAuth/index.ts).
const requiredInRealEnvironments = (name: string, testDefault: string) =>
	({
		production: z.string().min(1, { message: `${name} must be set in production` }),
		development: z.string().min(1, { message: `${name} must be set in development` }),
		testing: z.string().min(1).default(testDefault),
		e2e: z.string().min(1).default(testDefault),
	}) satisfies Record<NodeEnv, z.ZodType<string>>;

const googleClientIdEnvMap = requiredInRealEnvironments('GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID_DEFAULT);
const googleClientSecretEnvMap = requiredInRealEnvironments('GOOGLE_CLIENT_SECRET', GOOGLE_CLIENT_SECRET_DEFAULT);

export const buildGoogleAuthSchema = (nodeEnv: NodeEnv) =>
	z.object({
		GOOGLE_CLIENT_ID: googleClientIdEnvMap[nodeEnv],
		GOOGLE_CLIENT_SECRET: googleClientSecretEnvMap[nodeEnv],
	});

export type GoogleAuthSchema = z.infer<ReturnType<typeof buildGoogleAuthSchema>>;

export const parseGoogleAuthEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): GoogleAuthSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildGoogleAuthSchema(resolvedNodeEnv).parse(source);
};
