import { CreateIngredient, FindIngredientByName, UpdateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { INGREDIENT_UNIQUE_INDEXES, IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { getNameCompareQuery } from '../helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { mapDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { removeLeanVersionKey } from '@/infrastructure/mongo/helpers/mongoose.helpers';

export class IngredientsRepository implements IIngredientsRepository {
	async create(data: CreateIngredient): Promise<Ingredient> {
		try {
			return await IngredientModel.create(data);
		} catch (error) {
			throw mapDuplicateKeyError(error, INGREDIENT_UNIQUE_INDEXES, 'apiResponses.ingredients.alreadyExist', {
				path: 'Ingredients.repository',
			});
		}
	}
	async update({ id, ...data }: UpdateIngredient): Promise<Ingredient> {
		let ingredient: Ingredient | null;
		try {
			ingredient = await IngredientModel.findByIdAndUpdate<Ingredient>(id, data, {
				returnDocument: 'after',
			}).exec();
		} catch (error) {
			throw mapDuplicateKeyError(error, INGREDIENT_UNIQUE_INDEXES, 'apiResponses.ingredients.alreadyExist', {
				path: 'Ingredients.repository',
			});
		}
		if (!ingredient) {
			throw new NotFoundError('apiResponses.ingredients.notFound', {
				path: 'Ingredients.repository',
				cause: 'Error on findOneAndUpdate operation',
			});
		}
		return ingredient;
	}

	async delete(id: string): Promise<Ingredient> {
		const ingredient = await IngredientModel.findByIdAndDelete<Ingredient>(id).exec();
		if (!ingredient) {
			throw new NotFoundError('apiResponses.ingredients.notFound', {
				path: 'Ingredients.repository',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return ingredient;
	}

	async findByName(data: FindIngredientByName): Promise<Ingredient | null> {
		return IngredientModel.findOne<Ingredient>({ $or: getNameCompareQuery(data) })
			.lean<Ingredient>({ transform: removeLeanVersionKey })
			.exec();
	}

	async findById(id: string): Promise<Ingredient | null> {
		return IngredientModel.findById<Ingredient>(id).lean<Ingredient>({ transform: removeLeanVersionKey }).exec();
	}

	async findByIdList(ids: string[]): Promise<Ingredient[]> {
		return IngredientModel.find<Ingredient>({ _id: { $in: ids } })
			.lean<Ingredient[]>({ transform: removeLeanVersionKey })
			.exec();
	}

	async findAll(query: QueryParams): Promise<Ingredient[]> {
		const mongooseQuery = buildQuery<Ingredient>(query, IngredientModel);
		return mongooseQuery.lean<Ingredient[]>({ transform: removeLeanVersionKey }).exec();
	}
}
