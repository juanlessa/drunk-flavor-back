import { Category } from '@/core/drinks/entities/category.entity';
import { CreateCategory, FindCategoryByName, UpdateCategory } from '@/core/drinks/dtos/category.dtos';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { ObjectId } from 'mongodb';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { QueryParams } from '@/shared/types/query.types';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';

export class CategoriesRepositoryInMemory implements ICategoriesRepository {
	collection: Category[] = [];

	async create({ ...data }: CreateCategory): Promise<Category> {
		const record: Category = {
			_id: new ObjectId(),
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		};

		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateCategory): Promise<Category> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.categories.notFound', {
				path: 'CategoriesInMemory.repository',
				cause: 'Error on findByIdAndUpdate operation',
			});
		}
		let record = this.collection[recordIndex];
		record = deepUpdate<Category>(data, record);
		record.updated_at = new Date();

		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<Category> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.categories.notFound', {
				path: 'CategoriesInMemory.repository',
				cause: 'Error on findByIdAndDelete operation',
			});
		}
		const [deletedRecord] = this.collection.splice(recordIndex, 1);
		return deletedRecord;
	}

	async findByName(translations: FindCategoryByName): Promise<Category | null> {
		const record = this.collection.find((rec) => compareTranslationsName(rec.translations, translations));
		return record || null;
	}

	async findById(id: string): Promise<Category | null> {
		const record = this.collection.find((rec) => rec._id.toString() === id);
		return record || null;
	}

	async findAll(query: QueryParams): Promise<Category[]> {
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
