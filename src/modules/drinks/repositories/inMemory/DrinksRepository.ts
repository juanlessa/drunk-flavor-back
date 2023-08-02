import { IDrinksRepository } from '../IDrinksRepository';
import { ICreateDrink, IUpdateDrink } from '@modules/drinks/dtos/Drinks';
import { ObjectId } from 'bson';
import Drink from '@modules/drinks/entities/Drink';
import { IIngredientsRepository } from '../IIngredientsRepository';
import Ingredient from '@modules/drinks/entities/Ingredient';

class DrinksRepositoryInMemory implements IDrinksRepository {
	drinks: Drink[] = [];
	ingredientsRepository: IIngredientsRepository;
	constructor(ingredientsRepository: IIngredientsRepository) {
		this.ingredientsRepository = ingredientsRepository;
	}

	async create({ name, method, ingredients }: ICreateDrink): Promise<Drink> {
		const drink: Drink = {
			id: new ObjectId().toString(),
			name,
			method,
			ingredients,
			cover: '',
			thumbnail: '',
			created_at: new Date()
		};
		this.drinks.push(drink);
		return drink;
	}

	async update({ id, name, method, ingredients, cover, thumbnail }: IUpdateDrink): Promise<Drink> {
		let drink: Drink;
		this.drinks = this.drinks.map((d) => {
			if (d.id === id) {
				drink = {
					id: d.id,
					name,
					method,
					ingredients,
					cover,
					thumbnail,
					created_at: d.created_at
				};
				return drink;
			}
			return d;
		});
		return drink;
	}

	async delete(id: string): Promise<Drink> {
		let drink: Drink;
		const drinkIndex = this.drinks.findIndex((d) => d.id === id);
		if (drinkIndex != -1) {
			const deleted = this.drinks.splice(drinkIndex, 1);
			drink = deleted[0];
		}
		return drink;
	}

	async findByName(name: string): Promise<Drink> {
		let drink = this.drinks.find((d) => d.name === name);
		if (drink) {
			drink.ingredients = undefined;
		}
		return drink;
	}

	async findById(id: string): Promise<Drink> {
		let drink = this.drinks.find((d) => d.id === id);
		if (drink) {
			drink.ingredients = undefined;
		}
		return drink;
	}

	async findAll(): Promise<Drink[]> {
		let results = [...this.drinks];
		results = results.map((d) => (d.ingredients = undefined));
		return results;
	}

	async findByNameWithIngredientsDetails(name: string): Promise<Drink> {
		let drink = this.drinks.find((d) => d.name === name);
		if (drink) {
			drink.ingredients = await Promise.all(
				drink.ingredients.map(async (ing) => {
					ing.ingredient = await this.ingredientsRepository.findById(ing.ingredientId);
					return ing;
				})
			);
		}

		return drink;
	}

	async findByIdWithIngredientsDetails(id: string): Promise<Drink> {
		let drink = this.drinks.find((d) => d.id === id);
		if (drink) {
			drink.ingredients = await Promise.all(
				drink.ingredients.map(async (ing) => {
					ing.ingredient = await this.ingredientsRepository.findById(ing.ingredientId);
					return ing;
				})
			);
		}
		return drink;
	}

	async findAllWithIngredientsDetails(): Promise<Drink[]> {
		let drinks = [...this.drinks];
		drinks = await Promise.all(
			drinks.map(async (d) => {
				d.ingredients = await Promise.all(
					d.ingredients.map(async (ing) => {
						ing.ingredient = await this.ingredientsRepository.findById(ing.ingredientId);
						return ing;
					})
				);
				return d;
			})
		);
		return drinks;
	}
}

export { DrinksRepositoryInMemory };
