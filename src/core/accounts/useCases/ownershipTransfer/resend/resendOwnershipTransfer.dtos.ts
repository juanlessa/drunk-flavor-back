import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';
import { Actor } from '@/shared/accessControl/actor.types';

export type ResendOwnershipTransfer = {
	actor: Actor;
	administrativeContext?: AdministrativeEventContext;
};
