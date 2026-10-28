import { CreateAdministrativeEvent } from '@/core/accounts/dtos/administrativeEvent.dtos';
import { AdministrativeEvent } from '@/core/accounts/entities/administrativeEvent.entity';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { AdministrativeEventModel } from '../entities/administrativeEvent.model';
import { AdministrativeEventMapper } from '../mappers/administrativeEvent.mapper';

export class AdministrativeEventsRepository implements IAdministrativeEventsRepository {
	async create(data: CreateAdministrativeEvent): Promise<AdministrativeEvent> {
		const document = await AdministrativeEventModel.create(AdministrativeEventMapper.toPersistence(data));
		return AdministrativeEventMapper.toDomain(document);
	}
}
