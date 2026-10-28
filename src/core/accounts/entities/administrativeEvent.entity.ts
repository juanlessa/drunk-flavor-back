import { Role } from '@/shared/accessControl/roles';
import { UserStatus } from './user.entity';

export const AdministrativeEventActions = {
	userCreated: 'user.created',
	userRoleChanged: 'user.role_changed',
	userSuspended: 'user.suspended',
	userReactivated: 'user.reactivated',
	userDeleted: 'user.deleted',
} as const;

export type AdministrativeEventAction = (typeof AdministrativeEventActions)[keyof typeof AdministrativeEventActions];

export const AdministrativeEventOrigins = {
	api: 'api',
	cli: 'cli',
	system: 'system',
} as const;

export type AdministrativeEventOrigin = (typeof AdministrativeEventOrigins)[keyof typeof AdministrativeEventOrigins];

export type AdministrativeEventState = Partial<{
	role: Role;
	status: UserStatus;
}>;

export type AdministrativeEventContext = {
	origin: AdministrativeEventOrigin;
	requestId?: string;
	reason?: string;
};

export type AdministrativeEvent = {
	id: string;
	actorId: string;
	targetUserId: string;
	action: AdministrativeEventAction;
	before?: AdministrativeEventState;
	after?: AdministrativeEventState;
	origin: AdministrativeEventOrigin;
	requestId?: string;
	reason?: string;
	occurredAt: Date;
};
