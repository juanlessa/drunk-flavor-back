import { CreateAdministrativeEvent } from '@/core/accounts/dtos/administrativeEvent.dtos';
import { AdministrativeEvent } from '@/core/accounts/entities/administrativeEvent.entity';

export interface IAdministrativeEventsRepository {
	create(data: CreateAdministrativeEvent): Promise<AdministrativeEvent>;
}
