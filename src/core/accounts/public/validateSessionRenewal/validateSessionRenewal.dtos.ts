import { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';

export type ValidateSessionRenewal = {
	session: AuthenticatedSession;
};
