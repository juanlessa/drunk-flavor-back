import { SessionOptions } from 'express-session';
import { env } from '@/env';

export const sessionsConfig = {
	name: 'refreshToken',
	secret: env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false, // if true only works with HTTPS
		maxAge: 1000 * 60 * 60 * 24 * 15 // 15 days
	}
} as SessionOptions;
