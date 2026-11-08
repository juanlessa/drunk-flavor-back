import {
	CreateIngredient,
	FindIngredientByName,
	UpdateIngredient,
	UpdateIngredientData,
} from '@/core/drinks/dtos/ingredient.dtos';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { toMongoUpdateSet } from '@/infrastructure/mongo/helpers/mapper.helpers';
import { mapDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { SEARCH_KEYS_FIELD } from '@/infrastructure/mongo/constants/search.constants';
import {
	INGREDIENT_SEARCH_FIELDS,
	INGREDIENT_SEARCH_OPTIONS,
	buildTranslationsSearchKeys,
} from '@/core/drinks/helpers/searchKeys.helpers';
import { Languages, Language } from '@/core/drinks/types/translations';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { INGREDIENT_UNIQUE_INDEXES, IngredientModel, IngredientPersistence } from '../entities/ingredient.model';
import { findByTranslatedName, getSortCollation } from '../helpers/translations.helpers';
import { IngredientMapper } from '../mappers/ingredient.mapper';

const LANGUAGES = Object.keys(Languages) as Language[];

const descriptionPath = (language: Language) => `translations.${language}.description`;

/** Persisted fields that an update explicitly removes (a `null` description or brand). */
const getUnsetFields = (data: UpdateIngredientData): string[] => {
	const descriptions = LANGUAGES.filter((language) => data.translations?.[language]?.description === null).map(
		descriptionPath,
	);
	return data.brand === null ? [...descriptions, 'brand'] : descriptions;
};

/** Applies the translations patch to the current translations, dropping the removed descriptions. */
const mergeTranslations = (
	current: IngredientPersistence['translations'],
	patch: Partial<IngredientPersistence['translations']> | undefined,
	unsetFields: string[],
): IngredientPersistence['translations'] =>
	LANGUAGES.reduce<IngredientPersistence['translations']>(
		(merged, language) => {
			const translation = { ...current[language], ...patch?.[language] };
			if (unsetFields.includes(descriptionPath(language))) delete translation.description;
			return { ...merged, [language]: translation };
		},
		{} as IngredientPersistence['translations'],
	);

export class IngredientsRepository implements IIngredientsRepository {
	async create(data: CreateIngredient): Promise<Ingredient> {
		try {
			const persistenceData = IngredientMapper.toPersistence(data);
			const document = await IngredientModel.create({
				...persistenceData,
				search_keys: buildTranslationsSearchKeys(
					persistenceData.translations,
					INGREDIENT_SEARCH_FIELDS,
					[persistenceData.brand],
					INGREDIENT_SEARCH_OPTIONS,
				),
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
		const unsetFields = getUnsetFields(data);
		if (persistenceData.translations || data.brand !== undefined) {
			const current = await IngredientModel.findById(objectId)
				.select('translations brand')
				.lean<Pick<IngredientPersistence, 'translations' | 'brand'>>()
				.exec();
			if (!current) throw this.notFound('update');
			update[SEARCH_KEYS_FIELD] = buildTranslationsSearchKeys(
				mergeTranslations(current.translations, persistenceData.translations, unsetFields),
				INGREDIENT_SEARCH_FIELDS,
				[data.brand === undefined ? current.brand : (data.brand ?? undefined)],
				INGREDIENT_SEARCH_OPTIONS,
			);
		}
		let document: IngredientPersistence | null;
		try {
			document = await IngredientModel.findByIdAndUpdate(
				objectId,
				{
					$set: update,
					...(unsetFields.length > 0 && {
						$unset: Object.fromEntries(unsetFields.map((field) => [field, 1])),
					}),
				},
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
		const persistenceQuery = IngredientMapper.toPersistenceQuery(query);
		const documents = await buildQuery<IngredientPersistence>(persistenceQuery, IngredientModel, {
			collation: getSortCollation(persistenceQuery.sort),
		})
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
