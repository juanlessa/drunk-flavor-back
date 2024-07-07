import 'express-session';

declare module 'express-session' {
	interface SessionData {
		refreshToken: { refreshToken: string; userId: string };
	}
}
