import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { ListUnitsWithAuthorshipCommand } from './listUnitsWithAuthorship.dtos';

/**
 * Lists the units for the people who contribute to the catalog: the ones the actor created come first, then the others,
 * each group in the order of the query. Unlike the public listing, it shows who created and last edited each one.
 */
export class ListUnitsWithAuthorshipService {
	constructor(private unitsRepository: IUnitsRepository) {}

	async execute({ query = {}, actor }: ListUnitsWithAuthorshipCommand) {
		return this.unitsRepository.findAllOwnedFirst(query, actor.id);
	}
}
