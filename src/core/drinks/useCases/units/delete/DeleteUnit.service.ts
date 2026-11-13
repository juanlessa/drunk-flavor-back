import { assertCanChangeUnit } from '@/core/drinks/helpers/catalogAuthorization.helpers';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { DeleteUnitCommand } from './deleteUnit.dtos';

export class DeleteUnitService {
	constructor(private unitsRepository: IUnitsRepository) {}
	async execute({ id, actor }: DeleteUnitCommand) {
		const unit = await this.unitsRepository.findById(id);
		if (!unit) {
			throw new NotFoundError('apiResponses.units.notFound', { path: 'DeleteUnit.service' });
		}
		assertCanChangeUnit('delete', unit, actor, 'DeleteUnit.service.forbidden');
		await this.unitsRepository.delete(id);
	}
}
