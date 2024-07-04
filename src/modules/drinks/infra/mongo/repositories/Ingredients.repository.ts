import { ICreateIngredient, IFindIngredientByName, IUpdateIngredient } from '@modules/drinks/dtos/ingredient.dtos';
import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredients.repository';
import { Ingredient } from '@modules/drinks/infra/mongo/entities/ingredient.model';
import { getNameCompareQuery } from '@modules/drinks/infra/mongo/utils/getNameCompareQuery';
import { NotFoundError } from '@shared/errors/error.lib';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';

class IngredientsRepository implements IIngredientsRepository {
	async create(data: ICreateIngredient): Promise<IIngredient> {
		return Ingredient.create(data);
	}
	async update({ id, ...data }: IUpdateIngredient): Promise<IIngredient> {
		const ingredient = await Ingredient.findByIdAndUpdate<IIngredient>(id, data, { new: true }).exec();
		if (!ingredient) {
			throw new NotFoundError(INGREDIENT_ERRORS.not_found, {
				path: 'Ingredients.repository',
				cause: 'Error on findOneAndUpdate operation'
			});
		}
		return ingredient;
	}

	async delete(id: string): Promise<IIngredient> {
		const ingredient = await Ingredient.findByIdAndDelete<IIngredient>(id).exec();
		if (!ingredient) {
			throw new NotFoundError(INGREDIENT_ERRORS.not_found, {
				path: 'Ingredients.repository',
				cause: 'Error on findOneAndDelete operation'
			});
		}
		return ingredient;
	}

	async findByName(data: IFindIngredientByName): Promise<IIngredient | null> {
		return Ingredient.findOne<IIngredient>({ $or: getNameCompareQuery(data) }).exec();
	}

	async findById(id: string): Promise<IIngredient | null> {
		return Ingredient.findById<IIngredient>(id).exec();
	}

	async findAll(): Promise<IIngredient[]> {
		return Ingredient.find<IIngredient>().exec();
	}
	async findByIdList(ids: string[]): Promise<IIngredient[]> {
		return Ingredient.find<IIngredient>({ _id: { $in: ids } }).exec();
	}
}

export { IngredientsRepository };
