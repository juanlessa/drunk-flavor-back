import { z } from 'zod/v4';
import { Actor } from '@/shared/accessControl/actor.types';
import { NonOwnerRole } from '@/shared/accessControl/roles';
import { getUserAdministrativeCapabilitiesSchema } from './getUserAdministrativeCapabilities.schema';

export const UserAdministrativeCapabilityActions = {
	changeRole: 'changeRole',
	suspend: 'suspend',
	reactivate: 'reactivate',
	close: 'close',
	requestOwnershipTransfer: 'requestOwnershipTransfer',
} as const;

export type UserAdministrativeCapabilityAction =
	(typeof UserAdministrativeCapabilityActions)[keyof typeof UserAdministrativeCapabilityActions];

export type GetUserAdministrativeCapabilitiesReqParams = z.infer<typeof getUserAdministrativeCapabilitiesSchema>;

export type GetUserAdministrativeCapabilities = {
	id: string;
	actor: Actor;
};

export type UserAdministrativeCapabilities = {
	actions: UserAdministrativeCapabilityAction[];
	roleTransitions: NonOwnerRole[];
};
