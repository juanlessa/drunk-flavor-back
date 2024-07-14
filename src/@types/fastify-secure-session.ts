import '@fastify/secure-session';
import { AuthSessionData } from '@/infra/fastify/types/session.types';
import { AUTH_SESSION } from '@/infra/fastify/constants/session.constants';

declare module '@fastify/secure-session' {
	interface SessionData {
		[AUTH_SESSION]: AuthSessionData;
	}
}
