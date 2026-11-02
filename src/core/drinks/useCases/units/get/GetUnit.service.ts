import { GetUnit } from '@/core/drinks/dtos/unit.dtos';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { NotFoundError } from '@/shared/error/error.lib';

export class GetUnitService {
	constructor(private unitsRepository: IUnitsRepository) {}

	async execute({ id }: GetUnit): Promise<Unit> {
		const unit = await this.unitsRepository.findById(id);
		if (!unit) throw new NotFoundError('apiResponses.units.notFound', { path: 'GetUnit.service' });
		return unit;
	}
}
