import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { CreateDrink, FindDrinkByName, UpdateDrink } from '@/core/drinks/dtos/drink.dtos';
import { ObjectId } from 'mongodb';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { DRINK_MESSAGES } from '@/core/drinks/constants/drinks.constants';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { QueryParams } from '@/shared/types/query.types';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';

export class DrinksRepositoryInMemory implements IDrinksRepository {
	drinks: Drink[] = [];

	async create({ translations, ingredients }: CreateDrink): Promise<Drink> {
		const drink: Drink = {
			translations,
			ingredients,
			cover: '',
			thumbnail: '',
			_id: new ObjectId(),
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.drinks.push(drink);
		return drink;
	}

	async update({ id, ...data }: UpdateDrink): Promise<Drink> {
		const drinkIndex = this.drinks.findIndex((d) => d._id.toString() === id);
		if (drinkIndex === -1) {
			throw new NotFoundError(DRINK_MESSAGES.notFound.message, {
				path: 'drinksInMemory.repository',
				cause: 'Error on findOneAndUpdate operation',
			});
		}

		let drink = this.drinks[drinkIndex];
		drink = deepUpdate(data, drink);
		drink.updated_at = new Date();

		this.drinks[drinkIndex] = drink;
		return drink;
	}

	async delete(id: string): Promise<Drink> {
		const drinkIndex = this.drinks.findIndex((d) => d._id.toString() === id);
		if (drinkIndex === -1) {
			throw new NotFoundError(DRINK_MESSAGES.notFound.message, {
				path: 'drinksInMemory.repository',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		const [deletedDrink] = this.drinks.splice(drinkIndex, 1);
		return deletedDrink;
	}

	async findByName(translations: FindDrinkByName): Promise<Drink | null> {
		const drink = this.drinks.find((d) => compareTranslationsName(d.translations, translations));
		return drink || null;
	}

	async findById(id: string): Promise<Drink | null> {
		const drink = this.drinks.find((d) => d._id.toString() === id);
		return drink || null;
	}

	async findAll(query: QueryParams): Promise<Drink[]> {
		let found = [...this.drinks];

		if (query.search) {
			found = filterItemsBySearchCriteria(found, query.search);
		}

		if (query.sort) {
			found = sortItemsByFields(found, query.sort);
		}

		found = paginateItems(
			found,
			query.limit || DEFAULT_QUERY_PARAMS.limit,
			query.page || DEFAULT_QUERY_PARAMS.page,
		);

		return found;
	}
}
