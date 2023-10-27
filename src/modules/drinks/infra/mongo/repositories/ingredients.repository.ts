import { ICreateIngredient, IFindIngredientByName, IUpdateIngredient } from '@modules/drinks/dtos/ingredient.dtos';
import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredients.repository';
import { Ingredient } from '@modules/drinks/infra/mongo/entities/ingredient.model';
import { getNameCompareQuery } from '@modules/drinks/infra/mongo/utils/getNameCompareQuery';

class IngredientsRepository implements IIngredientsRepository {
	async create(data: ICreateIngredient): Promise<IIngredient> {
		const ingredient = new Ingredient(data);
		await ingredient.save();
		return ingredient;
	}
	async update({ id, ...data }: IUpdateIngredient): Promise<IIngredient> {
		return await Ingredient.findByIdAndUpdate<IIngredient>({ _id: id }, { ...data }).exec();
	}

	async delete(id: string): Promise<IIngredient> {
		return await Ingredient.findOneAndDelete<IIngredient>({ _id: id }).exec();
	}

	async findByName(data: IFindIngredientByName): Promise<IIngredient> {
		return await Ingredient.findOne<IIngredient>({ $or: getNameCompareQuery(data) }).exec();
	}

	async findById(id: string): Promise<IIngredient> {
		return await Ingredient.findById<IIngredient>(id).exec();
	}

	async findAll(): Promise<IIngredient[]> {
		return await Ingredient.find<IIngredient>().exec();
	}
	async findByIdList(ids: string[]): Promise<IIngredient[]> {
		return Ingredient.find<IIngredient>({ _id: { $in: ids } }).exec();
	}
}

export { IngredientsRepository };
