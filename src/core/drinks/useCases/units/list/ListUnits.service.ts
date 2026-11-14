import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { ListUnitsCommand } from './listUnits.dtos';

export class ListUnitsService {
	constructor(private unitsRepository: IUnitsRepository) {}
	async execute({ query = {} }: ListUnitsCommand) {
		const units = await this.unitsRepository.findAll(query);
		return units.map(omitAuthorship);
	}
}
