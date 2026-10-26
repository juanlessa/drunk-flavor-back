import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { CreateUnitDTO } from './createUnit.dtos';

export class CreateUnitService {
	constructor(private unitsRepository: IUnitsRepository) {}

	async execute(data: CreateUnitDTO) {
		const existingUnit = await this.unitsRepository.findByName(mapToTranslationsName(data.translations));
		if (existingUnit) {
			throw new BadRequestError('apiResponses.units.alreadyExist', { path: 'CreateUnit.service' });
		}
		await this.unitsRepository.create(data);
	}
}
