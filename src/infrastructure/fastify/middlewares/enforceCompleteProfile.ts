import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { ForbiddenError } from '@/shared/error/error.lib';
import { Middleware } from '../types/fastify.types';

/**
 * Blocks `incomplete_profile` users from business routes until they complete
 * their profile. Reads only `request.user.status` (carried in the access token),
 * so it performs no DB lookup and MUST run after `verifyAndRenewToken`.
 */
export const enforceCompleteProfile: Middleware = async (request, _reply) => {
	if (request.user.status === UserStatuses.incomplete_profile) {
		throw new ForbiddenError('apiResponses.auth.profileIncomplete', {
			path: 'enforceCompleteProfile.middleware',
		});
	}
};
