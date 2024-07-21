import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { ListDrinksDTO } from './listDrinks.dtos';

export class ListDrinksService {
	constructor(private drinksRepository: IDrinksRepository) {}

	async execute({ query = {} }: ListDrinksDTO) {
		const drinks = await this.drinksRepository.findAll(query);

		return drinks;
	}
}
