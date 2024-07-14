import type { FastifyCookieOptions, CookieSerializeOptions } from '@fastify/cookie';
import { env } from '@/env';

/** Amount of milliseconds in a second */
export const MS = 1000;
/** Amount of seconds in a day */
export const DAY_SECONDS = 24 * 60 * 60;
/** Amount of seconds in 30 days */
export const TTL_30_DAYS = 30 * DAY_SECONDS;

export const AUTH_COOKIE = 'Authorization';

export const AUTH_COOKIE_OPTIONS = {
	maxAge: TTL_30_DAYS,
	httpOnly: true,
	signed: true,
	sameSite: true,
	secure: true, // if true only works with HTTPS
	path: '/',
} as const satisfies CookieSerializeOptions;

export const FASTIFY_COOKIE_OPTIONS = {
	secret: env.COOKIE_SECRET,
	parseOptions: { ...AUTH_COOKIE_OPTIONS },
} as const satisfies FastifyCookieOptions;
