import { AdministrativeEvent } from '@/core/accounts/entities/administrativeEvent.entity';

export type CreateAdministrativeEvent = Omit<AdministrativeEvent, 'id' | 'occurredAt'> & {
	occurredAt?: Date;
};
