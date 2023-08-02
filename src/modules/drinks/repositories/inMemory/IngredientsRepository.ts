import { ICreateIngredient, IUpdateIngredient } from '@modules/drinks/dtos/ingredients';
import Ingredient from '@modules/drinks/entities/Ingredient';
import { IIngredientsRepository } from '../IIngredientsRepository';
import { ObjectId } from 'bson';
import { ICategoriesRepository } from '../ICategoriesRepository';

class IngredientsRepositoryInMemory implements IIngredientsRepository {
	ingredients: Ingredient[] = [];
	categoriesRepository: ICategoriesRepository;
	constructor(categoriesRepository: ICategoriesRepository) {
		this.categoriesRepository = categoriesRepository;
	}
	async create({
		name,
		categoryId,
		unitySingular,
		unityPlural,
		isAlcoholic
	}: ICreateIngredient): Promise<Ingredient> {
		let ingredient: Ingredient = {
			id: new ObjectId().toString(),
			name,
			categoryId,
			unitySingular,
			unityPlural,
			isAlcoholic,
			created_at: new Date()
		};

		this.ingredients.push(ingredient);

		const category = await this.categoriesRepository.findById(categoryId);
		ingredient.category = category;

		return ingredient;
	}

	async update({
		id,
		name,
		categoryId,
		unitySingular,
		unityPlural,
		isAlcoholic
	}: IUpdateIngredient): Promise<Ingredient> {
		let ingredient: Ingredient;

		this.ingredients = this.ingredients.map((ing) => {
			if (ing.id === id) {
				ingredient = {
					id: ing.id,
					name,
					categoryId,
					unitySingular,
					unityPlural,
					isAlcoholic,
					created_at: ing.created_at
				};
				return ingredient;
			}
			return ing;
		});

		const category = await this.categoriesRepository.findById(categoryId);
		ingredient.category = category;

		return ingredient;
	}

	async delete(id: string): Promise<Ingredient> {
		let ingredient: Ingredient;
		const ingredientIndex = this.ingredients.findIndex((ing) => ing.id === id);
		if (ingredientIndex != -1) {
			const deleted = this.ingredients.splice(ingredientIndex, 1);
			ingredient = deleted[0];
		}

		const category = await this.categoriesRepository.findById(ingredient.categoryId);
		ingredient.category = category;

		return ingredient;
	}

	async findByName(name: string): Promise<Ingredient> {
		let ingredient = this.ingredients.find((ing) => ing.name === name);
		if (ingredient) {
			const category = await this.categoriesRepository.findById(ingredient.categoryId);
			ingredient.category = category;
		}
		return ingredient;
	}

	async findById(id: string): Promise<Ingredient> {
		const ingredient = this.ingredients.find((ing) => ing.id === id);
		if (ingredient) {
			const category = await this.categoriesRepository.findById(ingredient.categoryId);
			ingredient.category = category;
		}
		return ingredient;
	}

	async findAll(): Promise<Ingredient[]> {
		let ingredients = [...this.ingredients];

		ingredients = await Promise.all(
			ingredients.map(async (ing) => {
				const category = await this.categoriesRepository.findById(ing.categoryId);
				ing.category = category;
				return ing;
			})
		);

		return ingredients;
	}
	async findByIdList(ids: string[]): Promise<Ingredient[]> {
		let ingredients = this.ingredients.filter((ing) => ids.includes(ing.id));

		ingredients = await Promise.all(
			ingredients.map(async (ing) => {
				const category = await this.categoriesRepository.findById(ing.categoryId);
				ing.category = category;
				return ing;
			})
		);

		return ingredients;
	}
}

export { IngredientsRepositoryInMemory };
