import { CreateIngredient, FindIngredientByName, UpdateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { toMongoUpdateSet } from '@/infrastructure/mongo/helpers/mapper.helpers';
import { mapDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { SEARCH_KEYS_FIELD } from '@/infrastructure/mongo/constants/search.constants';
import { NAME_SEARCH_FIELDS, buildTranslationsSearchKeys } from '@/core/drinks/helpers/searchKeys.helpers';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { INGREDIENT_UNIQUE_INDEXES, IngredientModel, IngredientPersistence } from '../entities/ingredient.model';
import { findByTranslatedName } from '../helpers/translations.helpers';
import { IngredientMapper } from '../mappers/ingredient.mapper';

export class IngredientsRepository implements IIngredientsRepository {
	async create(data: CreateIngredient): Promise<Ingredient> {
		try {
			const persistenceData = IngredientMapper.toPersistence(data);
			const document = await IngredientModel.create({
				...persistenceData,
				search_keys: buildTranslationsSearchKeys(persistenceData.translations, NAME_SEARCH_FIELDS),
			});
			return IngredientMapper.toDomain(document);
		} catch (error) {
			throw mapDuplicateKeyError(error, INGREDIENT_UNIQUE_INDEXES, 'apiResponses.ingredients.alreadyExist', {
				path: 'Ingredients.repository',
			});
		}
	}

	async update({ id, ...data }: UpdateIngredient): Promise<Ingredient> {
		const objectId = IngredientMapper.toObjectId(id);
		if (!objectId) throw this.notFound('update');
		const persistenceData = IngredientMapper.toPersistence(data);
		const update = toMongoUpdateSet(persistenceData);
		if (persistenceData.translations) {
			const current = await IngredientModel.findById(objectId)
				.select('translations')
				.lean<Pick<IngredientPersistence, 'translations'>>()
				.exec();
			if (!current) throw this.notFound('update');
			update[SEARCH_KEYS_FIELD] = buildTranslationsSearchKeys(
				deepUpdate(persistenceData.translations, current.translations),
				NAME_SEARCH_FIELDS,
			);
		}
		let document: IngredientPersistence | null;
		try {
			document = await IngredientModel.findByIdAndUpdate(
				objectId,
				{ $set: update },
				{
					returnDocument: 'after',
					runValidators: true,
				},
			)
				.lean<IngredientPersistence>()
				.exec();
		} catch (error) {
			throw mapDuplicateKeyError(error, INGREDIENT_UNIQUE_INDEXES, 'apiResponses.ingredients.alreadyExist', {
				path: 'Ingredients.repository',
			});
		}
		if (!document) throw this.notFound('update');
		return IngredientMapper.toDomain(document);
	}

	async delete(id: string): Promise<Ingredient> {
		const objectId = IngredientMapper.toObjectId(id);
		if (!objectId) throw this.notFound('delete');
		const document = await IngredientModel.findByIdAndDelete(objectId).lean<IngredientPersistence>().exec();
		if (!document) throw this.notFound('delete');
		return IngredientMapper.toDomain(document);
	}

	async findByName(data: FindIngredientByName): Promise<Ingredient | null> {
		const document = await findByTranslatedName(data, (filter, collation) =>
			IngredientModel.findOne(filter).collation(collation).lean<IngredientPersistence>().exec(),
		);
		return document ? IngredientMapper.toDomain(document) : null;
	}

	async findById(id: string): Promise<Ingredient | null> {
		const objectId = IngredientMapper.toObjectId(id);
		if (!objectId) return null;
		const document = await IngredientModel.findById(objectId).lean<IngredientPersistence>().exec();
		return document ? IngredientMapper.toDomain(document) : null;
	}

	async findByIdList(ids: string[]): Promise<Ingredient[]> {
		const objectIds = ids.map(IngredientMapper.toObjectId).filter((id) => id !== null);
		if (objectIds.length !== ids.length) return [];
		const documents = await IngredientModel.find({ _id: { $in: objectIds } })
			.lean<IngredientPersistence[]>()
			.exec();
		return documents.map(IngredientMapper.toDomain);
	}

	async findAll(query: QueryParams): Promise<Ingredient[]> {
		const documents = await buildQuery<IngredientPersistence>(
			IngredientMapper.toPersistenceQuery(query),
			IngredientModel,
		)
			.lean<IngredientPersistence[]>()
			.exec();
		return documents.map(IngredientMapper.toDomain);
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.ingredients.notFound', {
			path: 'Ingredients.repository',
			cause: `Ingredient missing during ${operation}`,
		});
	}
}
