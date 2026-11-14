import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { GetUnitCommand } from './getUnit.dtos';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { NotFoundError } from '@/shared/error/error.lib';

export class GetUnitService {
	constructor(private unitsRepository: IUnitsRepository) {}

	async execute({ id }: GetUnitCommand) {
		const unit = await this.unitsRepository.findById(id);
		if (!unit) throw new NotFoundError('apiResponses.units.notFound', { path: 'GetUnit.service' });
		return omitAuthorship(unit);
	}
}
