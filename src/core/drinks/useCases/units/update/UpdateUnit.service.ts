import { assertCanChangeUnit } from '@/core/drinks/helpers/catalogAuthorization.helpers';
import { assertUnitIngredientName } from '@/core/drinks/helpers/unit.helpers';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { NotFoundError, ConflictError } from '@/shared/error/error.lib';
import { UpdateUnitCommand } from './updateUnit.dtos';

export class UpdateUnitService {
	constructor(private unitsRepository: IUnitsRepository) {}

	async execute({ actor, ...data }: UpdateUnitCommand): Promise<void> {
		const unit = await this.unitsRepository.findById(data.id);
		if (!unit) throw new NotFoundError('apiResponses.units.notFound', { path: 'UpdateUnit.service' });
		assertCanChangeUnit('update', unit, actor, 'UpdateUnit.service.forbidden');
		const duplicate = await this.unitsRepository.findByName(mapToTranslationsName(data.translations));
		if (duplicate && duplicate.id !== unit.id) {
			throw new ConflictError('apiResponses.units.alreadyExist', { path: 'UpdateUnit.service' });
		}

		// The values the unit will have after this update: an omitted value keeps the current one.
		assertUnitIngredientName(
			{
				useIngredientName: data.useIngredientName ?? unit.useIngredientName,
				kind: data.kind,
				symbol: data.symbol === undefined ? unit.symbol : data.symbol,
			},
			'UpdateUnit.service.1',
		);
		await this.unitsRepository.update({ ...data, updatedBy: actor.id });
	}
}
