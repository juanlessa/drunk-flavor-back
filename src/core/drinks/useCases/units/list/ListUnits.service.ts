import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { ListUnitsDTO } from './listUnits.dtos';

export class ListUnitsService {
	constructor(private unitsRepository: IUnitsRepository) {}
	async execute({ query = {} }: ListUnitsDTO) {
		return this.unitsRepository.findAll(query);
	}
}
