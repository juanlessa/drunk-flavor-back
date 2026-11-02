import { Role } from '@/shared/accessControl/roles';
import { UserStatus } from './user.entity';
import { AdministrativeEventActions, AdministrativeEventOrigins } from '../constants/administrativeEvent.constants';

export type AdministrativeEventAction = (typeof AdministrativeEventActions)[keyof typeof AdministrativeEventActions];

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
