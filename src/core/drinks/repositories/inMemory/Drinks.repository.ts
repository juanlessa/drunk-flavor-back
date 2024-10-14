import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { CreateDrink, FindDrinkByName, UpdateDrink } from '@/core/drinks/dtos/drink.dtos';
import { ObjectId } from 'mongodb';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { QueryParams } from '@/shared/types/query.types';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';

export class DrinksRepositoryInMemory implements IDrinksRepository {
	collection: Drink[] = [];

	async create({ ...data }: CreateDrink): Promise<Drink> {
		const record: Drink = {
			...data,
			cover: undefined,
			thumbnail: undefined,
			_id: new ObjectId(),
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateDrink): Promise<Drink> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.drinks.notFound', {
				path: 'drinksInMemory.repository',
				cause: 'Error on findOneAndUpdate operation',
			});
		}

		let record = this.collection[recordIndex];
		record = deepUpdate(data, record);
		record.updated_at = new Date();

		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<Drink> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.drinks.notFound', {
				path: 'drinksInMemory.repository',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		const [deletedRecord] = this.collection.splice(recordIndex, 1);
		return deletedRecord;
	}

	async findByName(translations: FindDrinkByName): Promise<Drink | null> {
		const record = this.collection.find((rec) => compareTranslationsName(rec.translations, translations));
		return record || null;
	}

	async findById(id: string): Promise<Drink | null> {
		const record = this.collection.find((rec) => rec._id.toString() === id);
		return record || null;
	}

	async findAll(query: QueryParams): Promise<Drink[]> {
		let found = [...this.collection];

		if (query.search) {
			found = filterItemsBySearchCriteria(found, query.search);
		}

		if (query.sort) {
			found = sortItemsByFields(found, query.sort);
		}

		found = paginateItems(
			found,
			query.limit || DEFAULT_QUERY_PARAMS.limit,
			query.page || DEFAULT_QUERY_PARAMS.page,
		);

		return found;
	}
}
