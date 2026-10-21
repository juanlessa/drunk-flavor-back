import { DeleteUnit } from '@/core/drinks/dtos/unit.dtos';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { BadRequestError } from '@/shared/error/error.lib';

export class DeleteUnitService {
	constructor(private unitsRepository: IUnitsRepository) {}
	async execute({ id }: DeleteUnit) {
		if (!(await this.unitsRepository.findById(id))) {
			throw new BadRequestError('apiResponses.units.notExist', { path: 'DeleteUnit.service' });
		}
		await this.unitsRepository.delete(id);
	}
}
