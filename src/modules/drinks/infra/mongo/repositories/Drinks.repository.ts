import { IDrinksRepository } from '@modules/drinks/repositories/IDrinks.repository';
import { IDrink } from '@modules/drinks/entities/drink.entity';
import { ICreateDrink, IFindDrinkByName, IUpdateDrink } from '@modules/drinks/dtos/drink.dtos';
import { Drink } from '@modules/drinks/infra/mongo/entities/drink.model';
import { getNameCompareQuery } from '@modules/drinks/infra/mongo/utils/getNameCompareQuery';
import { NotFoundError } from '@shared/errors/error.lib';
import { DRINK_ERRORS } from '@modules/drinks/errors/drink.errors';

class DrinksRepository implements IDrinksRepository {
	async create(data: ICreateDrink): Promise<IDrink> {
		return Drink.create(data);
	}

	async update({ id, ...data }: IUpdateDrink): Promise<IDrink> {
		const drink = await Drink.findByIdAndUpdate<IDrink>(id, data, { new: true }).exec();
		if (!drink) {
			throw new NotFoundError(DRINK_ERRORS.not_found, {
				path: 'drinks.repository',
				cause: 'Error on findOneAndUpdate operation'
			});
		}
		return drink;
	}

	async delete(id: string): Promise<IDrink> {
		const drink = await Drink.findByIdAndDelete<IDrink>(id).exec();
		if (!drink) {
			throw new NotFoundError(DRINK_ERRORS.not_found, {
				path: 'drinks.repository',
				cause: 'Error on findOneAndDelete operation'
			});
		}
		return drink;
	}

	async findByName(data: IFindDrinkByName): Promise<IDrink | null> {
		return Drink.findOne<IDrink>({ $or: getNameCompareQuery(data) }).exec();
	}

	async findById(id: string): Promise<IDrink | null> {
		return Drink.findById<IDrink>(id).exec();
	}

	async findAll(): Promise<IDrink[]> {
		return Drink.find<IDrink>().exec();
	}
}

export { DrinksRepository };
