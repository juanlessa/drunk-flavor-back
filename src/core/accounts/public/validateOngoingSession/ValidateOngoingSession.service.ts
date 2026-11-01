import { SessionChecks } from '@/core/accounts/constants/session.constants';
import { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';
import { loadCurrentSession } from '@/core/accounts/helpers/session.helpers';
import { hasUsableSessionStatus } from '@/core/accounts/policies/SessionVersion.policy';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ISessionVersionMarkerStore } from '@/core/accounts/stores/ISessionVersionMarker.store';
import { logger } from '@/shared/providers/logger';
import { ValidateOngoingSession } from './validateOngoingSession.dtos';

const SERVICE_PATH = 'ValidateOngoingSession.service';

/**
 * Validates a session that is in use within its validity window.
 * The persisted user is authoritative; the marker store only allows skipping that lookup when it proves that no
 * session-affecting change happened since the session was last issued or renewed.
 */
export class ValidateOngoingSessionService {
	constructor(
		private usersRepository: IUsersRepository,
		private sessionVersionMarkerStore: ISessionVersionMarkerStore,
	) {}

	async execute({ session }: ValidateOngoingSession): Promise<AuthenticatedSession> {
		if (await this.isProvenUnchanged(session)) {
			return session;
		}
		return loadCurrentSession(this.usersRepository, session, SERVICE_PATH);
	}

	private async isProvenUnchanged({ id, status, sessionVersion }: AuthenticatedSession): Promise<boolean> {
		if (!Number.isInteger(sessionVersion) || !hasUsableSessionStatus(status)) {
			logger.debug({ userId: id, sessionCheck: SessionChecks.claimsUnusable }, `${SERVICE_PATH}: session check`);
			return false;
		}

		const marker = await this.sessionVersionMarkerStore.find(id);
		if (marker.status === 'unavailable') {
			logger.debug(
				{ userId: id, sessionCheck: SessionChecks.markerStoreUnavailable, reason: marker.reason },
				`${SERVICE_PATH}: session check`,
			);
			return false;
		}

		const isUnchanged = marker.minimumSessionVersion === null || sessionVersion >= marker.minimumSessionVersion;
		logger.debug(
			{ userId: id, sessionCheck: isUnchanged ? SessionChecks.markerTrusted : SessionChecks.markerStale },
			`${SERVICE_PATH}: session check`,
		);
		return isUnchanged;
	}
}
