import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { CreateIngredient, FindIngredientByName, UpdateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { ObjectId } from 'mongodb';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';

export class IngredientsRepositoryInMemory implements IIngredientsRepository {
	collection: Ingredient[] = [];

	async create({ ...data }: CreateIngredient): Promise<Ingredient> {
		let record: Ingredient = {
			...data,
			_id: new ObjectId(),
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateIngredient): Promise<Ingredient> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.ingredients.notFound', {
				path: 'IngredientsInMemory.repository',
				cause: 'Error on findOneAndUpdate operation',
			});
		}

		let record = this.collection[recordIndex];
		record = deepUpdate(data, record);
		record.updated_at = new Date();

		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<Ingredient> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.ingredients.notFound', {
				path: 'IngredientsInMemory.repository',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		const [deletedRecord] = this.collection.splice(recordIndex, 1);
		return deletedRecord;
	}

	async findByName(translations: FindIngredientByName): Promise<Ingredient | null> {
		const record = this.collection.find((rec) => compareTranslationsName(rec.translations, translations));
		return record || null;
	}

	async findById(id: string): Promise<Ingredient | null> {
		const record = this.collection.find((rec) => rec._id.toString() === id);
		return record || null;
	}

	async findAll(query: QueryParams): Promise<Ingredient[]> {
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

	async findByIdList(ids: string[]): Promise<Ingredient[]> {
		const records = this.collection.filter((rec) => ids.includes(rec._id.toString()));
		return records;
	}
}
