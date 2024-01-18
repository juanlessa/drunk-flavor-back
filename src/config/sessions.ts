import { SessionOptions } from 'express-session';
import authConfig from './auth';
// refresh token
export default {
	name: 'refresh-token',
	secret: authConfig.secret_refresh_token,
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: false, // if true only works with HTTPS
		maxAge: 1000 * 60 * 60 * 24 * 15 // 15 days
	}
} as SessionOptions;
