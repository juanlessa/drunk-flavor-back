import * as dotenv from 'dotenv';
dotenv.config();

export default {
	secret_token: process.env.TOKEN_SECRET || 'test-token-secret',
	expires_in_token: process.env.TOKEN_EXPIRES_IN || '1h',
	expires_token_hours: Number(process.env.TOKEN_EXPIRES_HOURS) || 1,
	secret_refresh_token: process.env.REFRESH_TOKEN_SECRET || 'test-refresh-token-secret',
	expires_in_refresh_token: process.env.REFRESH_TOKEN_EXPIRES_IN || '1d',
	expires_refresh_token_seconds: Number(process.env.REFRESH_TOKEN_EXPIRES_SECONDS) || 86400 // 1 day
};
