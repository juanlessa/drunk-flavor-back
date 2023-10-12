import { IDrinksRepository } from '../IDrinks.repository';
import { ICreateDrink, IFindDrinkByName, IUpdateDrink } from '@modules/drinks/dtos/drink.dtos';
import { ObjectId } from 'bson';
import { IDrink } from '@modules/drinks/entities/drink.entity';
import { compareTranslationsName } from './utils/compareTranslationsName';

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
		let drink: IDrink;
		this.drinks = this.drinks.map((d) => {
			if (d._id === id) {
				drink = {
					_id: d._id,
					translations: data.translations || d.translations,
					ingredients: data.ingredients || d.ingredients,
					cover: data.cover || d.cover,
					thumbnail: data.thumbnail || d.thumbnail,
					created_at: d.created_at,
					updated_at: new Date()
				};
				return drink;
			}
			return d;
		});
		return drink;
	}

	async delete(id: string): Promise<IDrink> {
		let drink: IDrink;
		const drinkIndex = this.drinks.findIndex((d) => d._id === id);
		if (drinkIndex != -1) {
			const deleted = this.drinks.splice(drinkIndex, 1);
			drink = deleted[0];
		}
		return drink;
	}

	async findByName(translations: IFindDrinkByName): Promise<IDrink> {
		const drink = this.drinks.find((d) => compareTranslationsName(d.translations, translations));
		return drink;
	}

	async findById(id: string): Promise<IDrink> {
		const drink = this.drinks.find((d) => d._id === id);
		return drink;
	}

	async findAll(): Promise<IDrink[]> {
		let drinks = [...this.drinks];
		return drinks;
	}
}

export { DrinksRepositoryInMemory };
