import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { UpdateUnitDTO } from './updateUnit.dtos';

export class UpdateUnitService {
	constructor(private unitsRepository: IUnitsRepository) {}

	async execute(data: UpdateUnitDTO): Promise<void> {
		const unit = await this.unitsRepository.findById(data.id);
		if (!unit) throw new BadRequestError('apiResponses.units.notExist', { path: 'UpdateUnit.service' });
		if (data.translations) {
			const duplicate = await this.unitsRepository.findByName(mapToTranslationsName(data.translations));
			if (duplicate && duplicate.id !== unit.id) {
				throw new BadRequestError('apiResponses.units.alreadyExist', { path: 'UpdateUnit.service' });
			}
		}
		await this.unitsRepository.update(data);
	}
}
