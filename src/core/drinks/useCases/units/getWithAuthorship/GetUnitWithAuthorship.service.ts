import { GetUnit } from '@/core/drinks/dtos/unit.dtos';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { NotFoundError } from '@/shared/error/error.lib';

/**
 * Gets a unit for the people who contribute to the catalog. Unlike the public read, it shows who created and last
 * edited it. It is the single-record counterpart of the listing with authorship, so every unit is visible to them.
 */
export class GetUnitWithAuthorshipService {
	constructor(private unitsRepository: IUnitsRepository) {}

	async execute({ id }: GetUnit) {
		const unit = await this.unitsRepository.findById(id);
		if (!unit) {
			throw new NotFoundError('apiResponses.units.notFound', { path: 'GetUnitWithAuthorship.service' });
		}
		return unit;
	}
}
