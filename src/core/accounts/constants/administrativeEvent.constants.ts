export const AdministrativeEventActions = {
	ownershipTransferRequested: 'ownership.transfer_requested',
	ownershipTransferResent: 'ownership.transfer_resent',
	ownershipTransferCancelled: 'ownership.transfer_cancelled',
	ownershipTransferred: 'ownership.transferred',
	userCreated: 'user.created',
	userRoleChanged: 'user.role_changed',
	userSuspended: 'user.suspended',
	userReactivated: 'user.reactivated',
	userClosed: 'user.closed',
	userSessionsRevoked: 'user.sessions_revoked',
	userDeleted: 'user.deleted',
} as const;

export const AdministrativeEventOrigins = {
	api: 'api',
	cli: 'cli',
	system: 'system',
} as const;
