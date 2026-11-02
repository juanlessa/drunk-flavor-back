import { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';

export type ValidateOngoingSession = {
	session: AuthenticatedSession;
};
