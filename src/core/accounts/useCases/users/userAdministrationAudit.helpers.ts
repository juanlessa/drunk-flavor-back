import {
	AdministrativeEventContext,
	AdministrativeEventOrigins,
} from '@/core/accounts/entities/administrativeEvent.entity';
import { Role } from '@/shared/accessControl/roles';
import { ForbiddenError } from '@/shared/error/error.lib';
import { logger } from '@/shared/providers/logger';

export type UserAdministrationLogAction =
	'user.create' | 'user.get' | 'user.list' | 'user.change_role' | 'user.suspend' | 'user.reactivate' | 'user.delete';

type DeniedAdministrationDetails = {
	action: UserAdministrationLogAction;
	actorId: string;
	targetUserId?: string;
	requestedRole?: Role;
	context?: AdministrativeEventContext;
};

export const resolveAdministrativeEventContext = (context?: AdministrativeEventContext): AdministrativeEventContext =>
	context ?? { origin: AdministrativeEventOrigins.api };

export const authorizeUserAdministration = <T>(details: DeniedAdministrationDetails, authorize: () => T): T => {
	try {
		return authorize();
	} catch (error) {
		if (error instanceof ForbiddenError) {
			logger.warn(
				{
					action: details.action,
					actorId: details.actorId,
					targetUserId: details.targetUserId,
					requestedRole: details.requestedRole,
					origin: details.context?.origin ?? AdministrativeEventOrigins.api,
					requestId: details.context?.requestId,
					denial: error.message,
				},
				'User administration request denied',
			);
		}
		throw error;
	}
};
