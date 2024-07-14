import '@fastify/secure-session';
import { AuthSessionData } from '@/infrastructure/fastify/types/session.types';
import { AUTH_SESSION } from '@/infrastructure/fastify/constants/session.constants';

declare module '@fastify/secure-session' {
	interface SessionData {
		[AUTH_SESSION]: AuthSessionData;
	}
}
