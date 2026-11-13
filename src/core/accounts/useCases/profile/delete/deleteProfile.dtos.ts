import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';

export type DeleteProfileCommand = {
	id: string;
	administrativeContext?: AdministrativeEventContext;
};
