import { FastifyReply, FastifyRequest } from 'fastify';
import { AUTH_SESSION } from '../constants/session.constants';
import { UnauthorizedError } from '@/shared/error/error.lib';

export const RECENT_AUTHENTICATION_WINDOW_MS = 5 * 60 * 1000;

export const requireRecentAuthentication = async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
	const session = request.session.get(AUTH_SESSION);
	const timestamp = session?.reauthenticatedAt ?? session?.authenticatedAt;
	const authenticatedAt = timestamp ? Date.parse(timestamp) : Number.NaN;
	const isRecent =
		Number.isFinite(authenticatedAt) &&
		Date.now() - authenticatedAt >= 0 &&
		Date.now() - authenticatedAt <= RECENT_AUTHENTICATION_WINDOW_MS;

	if (!isRecent) {
		throw new UnauthorizedError('apiResponses.profile.recentAuthenticationRequired', {
			path: 'requireRecentAuthentication',
			cause: 'Recent authentication is required for this operation',
		});
	}
};
