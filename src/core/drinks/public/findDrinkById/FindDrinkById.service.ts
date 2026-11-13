import { Drink } from '@/core/drinks/entities/drink.entity';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { FindDrinkById } from './findDrinkById.dtos';

export class FindDrinkByIdService {
	constructor(private drinksRepository: IDrinksRepository) {}

	execute({ drinkId }: FindDrinkById): Promise<Drink | null> {
		return this.drinksRepository.findById(drinkId);
	}
}
