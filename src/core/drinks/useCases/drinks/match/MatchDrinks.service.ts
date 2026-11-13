import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { MatchDrinksCommand } from './matchDrinks.dtos';

export class MatchDrinksService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ ingredientIds, maxMissing, limit, page }: MatchDrinksCommand) {
		const matches = await this.drinksRepository.findByIngredients({ ingredientIds, maxMissing, limit, page });
		const items = matches.map(({ drink, missingIngredientIds }) => {
			if (drink.cover) {
				drink.cover.url = this.storageProvider.getFileURL(drink.cover.name);
			}
			if (drink.thumbnail) {
				drink.thumbnail.url = this.storageProvider.getFileURL(drink.thumbnail.name);
			}
			return {
				drink: omitAuthorship(drink),
				missingCount: missingIngredientIds.length,
				missingIngredientIds,
			};
		});
		return { items };
	}
}
