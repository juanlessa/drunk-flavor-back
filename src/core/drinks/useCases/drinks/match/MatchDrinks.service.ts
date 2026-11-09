import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { toDrinkView } from '@/core/drinks/mappers/drink.mappers';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { MatchDrinksDTO } from './matchDrinks.dtos';

export class MatchDrinksService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ ingredientIds, maxMissing, limit, page }: MatchDrinksDTO) {
		const matches = await this.drinksRepository.findByIngredients({ ingredientIds, maxMissing, limit, page });
		const items = matches.map(({ drink, missingIngredientIds }) => {
			if (drink.cover) {
				drink.cover.url = this.storageProvider.getFileURL(drink.cover.name);
			}
			if (drink.thumbnail) {
				drink.thumbnail.url = this.storageProvider.getFileURL(drink.thumbnail.name);
			}
			return {
				drink: toDrinkView(drink),
				missingCount: missingIngredientIds.length,
				missingIngredientIds,
			};
		});
		return { items };
	}
}
