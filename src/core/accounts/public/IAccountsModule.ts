import { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';
import { User } from '@/core/accounts/entities/user.entity';
import { FindUserById } from './findUserById/findUserById.dtos';
import { ValidateOngoingSession } from './validateOngoingSession/validateOngoingSession.dtos';
import { ValidateSessionRenewal } from './validateSessionRenewal/validateSessionRenewal.dtos';

export interface IAccountsModule {
	findUserById(data: FindUserById): Promise<User | null>;
	/** Validates a session in use; throws `SessionRevokedError` when it is no longer valid. */
	validateOngoingSession(data: ValidateOngoingSession): Promise<AuthenticatedSession>;
	/** Validates a request to extend a session; throws `SessionRevokedError` when it is no longer valid. */
	validateSessionRenewal(data: ValidateSessionRenewal): Promise<AuthenticatedSession>;
}
