import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { GetUnit } from '@/core/drinks/dtos/unit.dtos';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { NotFoundError } from '@/shared/error/error.lib';

export class GetUnitService {
	constructor(private unitsRepository: IUnitsRepository) {}

	async execute({ id }: GetUnit) {
		const unit = await this.unitsRepository.findById(id);
		if (!unit) throw new NotFoundError('apiResponses.units.notFound', { path: 'GetUnit.service' });
		return omitAuthorship(unit);
	}
}
