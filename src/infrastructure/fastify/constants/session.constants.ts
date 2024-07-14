import { SecureSessionPluginOptions } from '@fastify/secure-session';
import { AUTH_COOKIE_OPTIONS } from './cookie.constants';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(process.cwd());

export const AUTH_SESSION = '__Host-Refresh-Token';

export const SESSION_OPTIONS = {
	key: fs.readFileSync(path.join(root, 'secret-key')),
	cookie: {
		...AUTH_COOKIE_OPTIONS,
		signed: false,
	},
} as const satisfies SecureSessionPluginOptions;
