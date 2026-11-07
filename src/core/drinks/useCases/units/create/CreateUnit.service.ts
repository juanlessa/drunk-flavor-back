import { Unit } from '@/core/drinks/entities/unit.entity';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { ConflictError } from '@/shared/error/error.lib';
import { CreateUnitDTO } from './createUnit.dtos';

export class CreateUnitService {
	constructor(private unitsRepository: IUnitsRepository) {}

	async execute(data: CreateUnitDTO): Promise<Unit> {
		const existingUnit = await this.unitsRepository.findByName(mapToTranslationsName(data.translations));
		if (existingUnit) {
			throw new ConflictError('apiResponses.units.alreadyExist', { path: 'CreateUnit.service' });
		}
		return this.unitsRepository.create(data);
	}
}
