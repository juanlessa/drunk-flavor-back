import { SecureSessionPluginOptions } from '@fastify/secure-session';
import { AUTH_COOKIE_OPTIONS } from './cookie.constants';
import { getSessionKeyFilePath } from '../helpers/session.helpers';

export const AUTH_SESSION = 'refreshSession';
export const AUTH_SESSION_COOKIE = '__Host-Refresh-Token';

export const SESSION_OPTIONS = {
	cookieName: AUTH_SESSION_COOKIE,
	key: getSessionKeyFilePath(),
	cookie: {
		...AUTH_COOKIE_OPTIONS,
		signed: false,
	},
} as const satisfies SecureSessionPluginOptions;
