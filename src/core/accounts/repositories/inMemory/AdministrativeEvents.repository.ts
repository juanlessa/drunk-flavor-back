import { randomUUID } from 'node:crypto';
import { CreateAdministrativeEvent } from '@/core/accounts/dtos/administrativeEvent.dtos';
import { AdministrativeEvent } from '@/core/accounts/entities/administrativeEvent.entity';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';

export class AdministrativeEventsRepositoryInMemory implements IAdministrativeEventsRepository {
	collection: AdministrativeEvent[] = [];

	async create(data: CreateAdministrativeEvent): Promise<AdministrativeEvent> {
		const event: AdministrativeEvent = {
			id: randomUUID(),
			...data,
			occurredAt: data.occurredAt ?? new Date(),
		};
		this.collection.push(event);
		return event;
	}
}
