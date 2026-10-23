import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { CreateDrink, FindDrinkByName, UpdateDrink } from '@/core/drinks/dtos/drink.dtos';
import { DRINK_UNIQUE_INDEXES, DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { getNameCompareQuery } from '../helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { mapDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { removeLeanVersionKey } from '@/infrastructure/mongo/helpers/mongoose.helpers';

export class DrinksRepository implements IDrinksRepository {
	async create(data: CreateDrink): Promise<Drink> {
		try {
			return await DrinkModel.create(data);
		} catch (error) {
			throw mapDuplicateKeyError(error, DRINK_UNIQUE_INDEXES, 'apiResponses.drinks.alreadyExist', {
				path: 'drinks.repository',
			});
		}
	}

	async update({ id, ...data }: UpdateDrink): Promise<Drink> {
		let drink: Drink | null;
		try {
			drink = await DrinkModel.findByIdAndUpdate<Drink>(id, data, { returnDocument: 'after' }).exec();
		} catch (error) {
			throw mapDuplicateKeyError(error, DRINK_UNIQUE_INDEXES, 'apiResponses.drinks.alreadyExist', {
				path: 'drinks.repository',
			});
		}
		if (!drink) {
			throw new NotFoundError('apiResponses.drinks.notFound', {
				path: 'drinks.repository',
				cause: 'Error on findOneAndUpdate operation',
			});
		}
		return drink;
	}

	async delete(id: string): Promise<Drink> {
		const drink = await DrinkModel.findByIdAndDelete<Drink>(id).exec();
		if (!drink) {
			throw new NotFoundError('apiResponses.drinks.notFound', {
				path: 'drinks.repository',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return drink;
	}

	async findByName(data: FindDrinkByName): Promise<Drink | null> {
		return DrinkModel.findOne<Drink>({ $or: getNameCompareQuery(data) })
			.lean<Drink>({ transform: removeLeanVersionKey })
			.exec();
	}

	async findById(id: string): Promise<Drink | null> {
		return DrinkModel.findById<Drink>(id).lean<Drink>({ transform: removeLeanVersionKey }).exec();
	}

	async findAll(query: QueryParams): Promise<Drink[]> {
		const mongooseQuery = buildQuery<Drink>(query, DrinkModel);
		return mongooseQuery.lean<Drink[]>({ transform: removeLeanVersionKey }).exec();
	}
}
