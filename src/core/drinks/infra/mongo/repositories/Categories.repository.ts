import { CreateCategory, FindCategoryByName, UpdateCategory } from '@/core/drinks/dtos/category.dtos';
import { Category } from '@/core/drinks/entities/category.entity';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { toMongoUpdateSet } from '@/infrastructure/mongo/helpers/mapper.helpers';
import { mapDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { SEARCH_KEYS_FIELD } from '@/infrastructure/mongo/constants/search.constants';
import { NAME_SEARCH_FIELDS, buildTranslationsSearchKeys } from '@/core/drinks/helpers/searchKeys.helpers';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { CATEGORY_UNIQUE_INDEXES, CategoryModel, CategoryPersistence } from '../entities/category.model';
import { findByTranslatedName } from '../helpers/translations.helpers';
import { CategoryMapper } from '../mappers/category.mapper';

export class CategoriesRepository implements ICategoriesRepository {
	async create(data: CreateCategory): Promise<Category> {
		try {
			const persistenceData = CategoryMapper.toPersistence(data);
			const document = await CategoryModel.create({
				...persistenceData,
				search_keys: buildTranslationsSearchKeys(persistenceData.translations, NAME_SEARCH_FIELDS),
			});
			return CategoryMapper.toDomain(document);
		} catch (error) {
			throw mapDuplicateKeyError(error, CATEGORY_UNIQUE_INDEXES, 'apiResponses.categories.alreadyExist', {
				path: 'Categories.repository',
			});
		}
	}

	async update({ id, ...data }: UpdateCategory): Promise<Category> {
		const objectId = CategoryMapper.toObjectId(id);
		if (!objectId) throw this.notFound('update');
		const persistenceData = CategoryMapper.toPersistence(data);
		const update = toMongoUpdateSet(persistenceData);
		if (persistenceData.translations) {
			const current = await CategoryModel.findById(objectId)
				.select('translations')
				.lean<Pick<CategoryPersistence, 'translations'>>()
				.exec();
			if (!current) throw this.notFound('update');
			update[SEARCH_KEYS_FIELD] = buildTranslationsSearchKeys(
				deepUpdate(persistenceData.translations, current.translations),
				NAME_SEARCH_FIELDS,
			);
		}
		let document: CategoryPersistence | null;
		try {
			document = await CategoryModel.findByIdAndUpdate(
				objectId,
				{ $set: update },
				{
					returnDocument: 'after',
					runValidators: true,
				},
			)
				.lean<CategoryPersistence>()
				.exec();
		} catch (error) {
			throw mapDuplicateKeyError(error, CATEGORY_UNIQUE_INDEXES, 'apiResponses.categories.alreadyExist', {
				path: 'Categories.repository',
			});
		}
		if (!document) throw this.notFound('update');
		return CategoryMapper.toDomain(document);
	}

	async delete(id: string): Promise<Category> {
		const objectId = CategoryMapper.toObjectId(id);
		if (!objectId) throw this.notFound('delete');
		const document = await CategoryModel.findByIdAndDelete(objectId).lean<CategoryPersistence>().exec();
		if (!document) throw this.notFound('delete');
		return CategoryMapper.toDomain(document);
	}

	async findByName(data: FindCategoryByName): Promise<Category | null> {
		const document = await findByTranslatedName(data, (filter, collation) =>
			CategoryModel.findOne(filter).collation(collation).lean<CategoryPersistence>().exec(),
		);
		return document ? CategoryMapper.toDomain(document) : null;
	}

	async findById(id: string): Promise<Category | null> {
		const objectId = CategoryMapper.toObjectId(id);
		if (!objectId) return null;
		const document = await CategoryModel.findById(objectId).lean<CategoryPersistence>().exec();
		return document ? CategoryMapper.toDomain(document) : null;
	}

	async findAll(query: QueryParams): Promise<Category[]> {
		const documents = await buildQuery<CategoryPersistence>(CategoryMapper.toPersistenceQuery(query), CategoryModel)
			.lean<CategoryPersistence[]>()
			.exec();
		return documents.map(CategoryMapper.toDomain);
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.categories.notFound', {
			path: 'Categories.repository',
			cause: `Category missing during ${operation}`,
		});
	}
}
