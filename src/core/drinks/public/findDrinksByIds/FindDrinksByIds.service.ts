import { Drink } from '@/core/drinks/entities/drink.entity';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { FindDrinksByIds } from './findDrinksByIds.dtos';

export class FindDrinksByIdsService {
	constructor(private drinksRepository: IDrinksRepository) {}

	execute({ drinkIds }: FindDrinksByIds): Promise<Drink[]> {
		return this.drinksRepository.findByIds(drinkIds);
	}
}
