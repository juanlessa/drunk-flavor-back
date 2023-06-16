import { IDrinksRepository } from '../IDrinksRepository';
import { ICreateDrink, IDrinkResponse, IUpdateDrink } from '@modules/drinks/dtos/Drinks';
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

	async findByName(name: string): Promise<Drink> {
		const result = this.drinks.find((d) => d.name === name);
		return result;
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

	async findById(id: string): Promise<Drink> {
		const result = this.drinks.find((d) => d.id === id);
		return result;
	}

	async findAll(): Promise<Drink[]> {
		const results = [...this.drinks];
		return results;
	}

	async findByNameWithIngredientsDetails(name: string): Promise<IDrinkResponse[]> {
		const drink = this.drinks.find((d) => d.name === name);
		const result = await this.convertToDrinkResponse([drink]);
		return result;
	}

	async findByIdWithIngredientsDetails(id: string): Promise<IDrinkResponse[]> {
		const drink = this.drinks.find((d) => d.id === id);
		const result = await this.convertToDrinkResponse([drink]);
		return result;
	}

	async findAllWithIngredientsDetails(): Promise<IDrinkResponse[]> {
		const result = await this.convertToDrinkResponse([...this.drinks]);
		return result;
	}

	async removeDeletedIngredient(deletedIngredientId: string): Promise<void> {
		this.drinks = this.drinks.map((d) => {
			return {
				...d,
				ingredients: d.ingredients.filter((ing) => ing.ingredientId !== deletedIngredientId)
			};
		});
	}

	private async convertToDrinkResponse(data: Drink[]): Promise<IDrinkResponse[]> {
		const ingredientsId = new Set<string>();
		data.forEach((d) => d.ingredients.forEach((ing) => ingredientsId.add(ing.ingredientId)));
		const ingredientsList = await this.ingredientsRepository.findByIdList(Array.from(ingredientsId));
		const ingredientsMap = new Map<string, Ingredient>(ingredientsList.map((ing) => [ing.id, ing]));

		const result: IDrinkResponse[] = data.map((drink) => {
			return {
				id: drink.id,
				name: drink.name,
				method: drink.method,
				cover: drink.cover,
				thumbnail: drink.thumbnail,
				created_at: drink.created_at,
				ingredients: drink.ingredients.map((ing) => {
					const ingredientFullInfo = ingredientsMap[ing.ingredientId];
					return {
						ingredientId: ing.ingredientId,
						quantity: ing.quantity,
						name: ingredientFullInfo.name,
						category: ingredientFullInfo.category,
						unity: ingredientFullInfo.unity,
						colorTheme: ingredientFullInfo.colorTheme,
						isAlcoholic: ingredientFullInfo.isAlcoholic,
						created_at: ingredientFullInfo.created_at
					};
				})
			};
		});
		return result;
	}
}

export { DrinksRepositoryInMemory };
