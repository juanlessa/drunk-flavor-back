import { DeleteUnit } from '@/core/drinks/dtos/unit.dtos';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { NotFoundError } from '@/shared/error/error.lib';

export class DeleteUnitService {
	constructor(private unitsRepository: IUnitsRepository) {}
	async execute({ id }: DeleteUnit) {
		if (!(await this.unitsRepository.findById(id))) {
			throw new NotFoundError('apiResponses.units.notExist', { path: 'DeleteUnit.service' });
		}
		await this.unitsRepository.delete(id);
	}
}
