import { SecureSessionPluginOptions } from '@fastify/secure-session';
import { AUTH_COOKIE_OPTIONS } from './cookie.constants';
import path from 'node:path';
import fs from 'node:fs';
import { getRootPath } from '@/shared/helpers/getRootPath.helper';
import { env } from '@/env';

const root = getRootPath();

export const AUTH_SESSION = 'refreshSession';
export const AUTH_SESSION_COOKIE = '__Host-Refresh-Token';

export const SESSION_OPTIONS = {
	cookieName: AUTH_SESSION_COOKIE,
	key: ['e2e', 'testing'].includes(env.NODE_ENV) ? root : fs.readFileSync(path.join(root, 'secret-key')),
	cookie: {
		...AUTH_COOKIE_OPTIONS,
		signed: false,
	},
} as const satisfies SecureSessionPluginOptions;
