import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';

export type DeleteProfile = {
	id: string;
	administrativeContext?: AdministrativeEventContext;
};
