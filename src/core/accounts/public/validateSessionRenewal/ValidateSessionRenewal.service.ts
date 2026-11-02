import { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';
import { loadCurrentSession } from '@/core/accounts/helpers/session.helpers';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ValidateSessionRenewal } from './validateSessionRenewal.dtos';

const SERVICE_PATH = 'ValidateSessionRenewal.service';

/**
 * Validates a request to extend a session. Renewal always consults the persisted user: the renewed session must
 * carry the current role, status, and version, and renewal credentials outlive any session version marker.
 */
export class ValidateSessionRenewalService {
	constructor(private usersRepository: IUsersRepository) {}

	execute({ session }: ValidateSessionRenewal): Promise<AuthenticatedSession> {
		return loadCurrentSession(this.usersRepository, session, SERVICE_PATH);
	}
}
