import { IDrinksRepository } from '@/modules/drinks/repositories/IDrinks.repository';
import { Drink } from '@/modules/drinks/entities/drink.entity';
import { CreateDrink, FindDrinkByName, UpdateDrink } from '@/modules/drinks/dtos/drink.dtos';
import { DrinkModel } from '@/modules/drinks/infra/mongo/entities/drink.model';
import { getNameCompareQuery } from '../helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { DRINK_MESSAGES } from '@/shared/constants/ResponseMessages';

export class DrinksRepository implements IDrinksRepository {
	async create(data: CreateDrink): Promise<Drink> {
		return DrinkModel.create(data);
	}

	async update({ id, ...data }: UpdateDrink): Promise<Drink> {
		const drink = await DrinkModel.findByIdAndUpdate<Drink>(id, data, { new: true }).exec();
		if (!drink) {
			throw new NotFoundError(DRINK_MESSAGES.notFound.message, {
				path: 'drinks.repository',
				cause: 'Error on findOneAndUpdate operation',
			});
		}
		return drink;
	}

	async delete(id: string): Promise<Drink> {
		const drink = await DrinkModel.findByIdAndDelete<Drink>(id).exec();
		if (!drink) {
			throw new NotFoundError(DRINK_MESSAGES.notFound.message, {
				path: 'drinks.repository',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return drink;
	}

	async findByName(data: FindDrinkByName): Promise<Drink | null> {
		return DrinkModel.findOne<Drink>({ $or: getNameCompareQuery(data) }).exec();
	}

	async findById(id: string): Promise<Drink | null> {
		return DrinkModel.findById<Drink>(id).exec();
	}

	async findAll(): Promise<Drink[]> {
		return DrinkModel.find<Drink>().exec();
	}
}
