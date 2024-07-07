import { CreateIngredient, FindIngredientByName, UpdateIngredient } from '@/modules/drinks/dtos/ingredient.dtos';
import { Ingredient } from '@/modules/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '@/modules/drinks/repositories/IIngredients.repository';
import { IngredientModel } from '@/modules/drinks/infra/mongo/entities/ingredient.model';
import { getNameCompareQuery } from '../helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { INGREDIENT_MESSAGES } from '@/modules/drinks/constants/ingredients.constants';

export class IngredientsRepository implements IIngredientsRepository {
	async create(data: CreateIngredient): Promise<Ingredient> {
		return IngredientModel.create(data);
	}
	async update({ id, ...data }: UpdateIngredient): Promise<Ingredient> {
		const ingredient = await IngredientModel.findByIdAndUpdate<Ingredient>(id, data, { new: true }).exec();
		if (!ingredient) {
			throw new NotFoundError(INGREDIENT_MESSAGES.notFound.message, {
				path: 'Ingredients.repository',
				cause: 'Error on findOneAndUpdate operation',
			});
		}
		return ingredient;
	}

	async delete(id: string): Promise<Ingredient> {
		const ingredient = await IngredientModel.findByIdAndDelete<Ingredient>(id).exec();
		if (!ingredient) {
			throw new NotFoundError(INGREDIENT_MESSAGES.notFound.message, {
				path: 'Ingredients.repository',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return ingredient;
	}

	async findByName(data: FindIngredientByName): Promise<Ingredient | null> {
		return IngredientModel.findOne<Ingredient>({ $or: getNameCompareQuery(data) }).exec();
	}

	async findById(id: string): Promise<Ingredient | null> {
		return IngredientModel.findById<Ingredient>(id).exec();
	}

	async findAll(): Promise<Ingredient[]> {
		return IngredientModel.find<Ingredient>().exec();
	}
	async findByIdList(ids: string[]): Promise<Ingredient[]> {
		return IngredientModel.find<Ingredient>({ _id: { $in: ids } }).exec();
	}
}
