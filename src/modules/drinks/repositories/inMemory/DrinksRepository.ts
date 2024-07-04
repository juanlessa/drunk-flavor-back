import { IDrinksRepository } from '@modules/drinks/repositories/IDrinks.repository';
import { ICreateDrink, IFindDrinkByName, IUpdateDrink } from '@modules/drinks/dtos/drink.dtos';
import { ObjectId } from 'bson';
import { IDrink } from '@modules/drinks/entities/drink.entity';
import { compareTranslationsName } from '@modules/drinks/repositories/inMemory/utils/compareTranslationsName';
import { NotFoundError } from '@shared/errors/error.lib';
import { DRINK_ERRORS } from '@modules/drinks/errors/drink.errors';

class DrinksRepositoryInMemory implements IDrinksRepository {
	drinks: IDrink[] = [];

	async create({ translations, ingredients }: ICreateDrink): Promise<IDrink> {
		const drink: IDrink = {
			translations,
			ingredients,
			cover: '',
			thumbnail: '',
			_id: new ObjectId().toString(),
			created_at: new Date(),
			updated_at: new Date()
		};
		this.drinks.push(drink);
		return drink;
	}

	async update({ id, ...data }: IUpdateDrink): Promise<IDrink> {
		const drinkIndex = this.drinks.findIndex((d) => d._id === id);
		if (drinkIndex === -1) {
			throw new NotFoundError(DRINK_ERRORS.not_found, {
				path: 'drinksInMemory.repository',
				cause: 'Error on findOneAndUpdate operation'
			});
		}

		const drink = this.drinks[drinkIndex];
		drink.translations = data.translations ?? drink.translations;
		drink.ingredients = data.ingredients ?? drink.ingredients;
		drink.cover = data.cover ?? drink.cover;
		drink.thumbnail = data.thumbnail ?? drink.thumbnail;
		drink.updated_at = new Date();

		this.drinks[drinkIndex] = drink;
		return drink;
	}

	async delete(id: string): Promise<IDrink> {
		const drinkIndex = this.drinks.findIndex((d) => d._id === id);
		if (drinkIndex === -1) {
			throw new NotFoundError(DRINK_ERRORS.not_found, {
				path: 'drinksInMemory.repository',
				cause: 'Error on findOneAndDelete operation'
			});
		}
		const [deletedDrink] = this.drinks.splice(drinkIndex, 1);
		return deletedDrink;
	}

	async findByName(translations: IFindDrinkByName): Promise<IDrink | null> {
		const drink = this.drinks.find((d) => compareTranslationsName(d.translations, translations));
		return drink || null;
	}

	async findById(id: string): Promise<IDrink | null> {
		const drink = this.drinks.find((d) => d._id === id);
		return drink || null;
	}

	async findAll(): Promise<IDrink[]> {
		let drinks = [...this.drinks];
		return drinks;
	}
}

export { DrinksRepositoryInMemory };
