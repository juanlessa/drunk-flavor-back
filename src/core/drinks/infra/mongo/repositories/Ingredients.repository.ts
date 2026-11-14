import {
	CreateIngredient,
	FindIngredientByName,
	UpdateIngredient,
	UpdateIngredientData,
} from '@/core/drinks/dtos/ingredient.dtos';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { findOwnedFirst, findPage } from '@/infrastructure/mongo/helpers/query.helpers';
import { toMongoUpdateSet } from '@/infrastructure/mongo/helpers/mapper.helpers';
import { mapDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { buildIngredientSearchTiers } from '@/core/drinks/helpers/searchKeys.helpers';
import { Languages, Language } from '@/core/drinks/types/translations';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { INGREDIENT_UNIQUE_INDEXES, IngredientModel, IngredientPersistence } from '../entities/ingredient.model';
import { CREATED_BY_FIELD, clearAuthorshipByUser, omitAuthorshipDeep } from '../helpers/authorship.helpers';
import { toSearchFields } from '../helpers/searchFields.helpers';
import { findByTranslatedName, getSortCollation } from '../helpers/translations.helpers';
import { IngredientMapper } from '../mappers/ingredient.mapper';

const LANGUAGES = Object.keys(Languages) as Language[];

const descriptionPath = (language: Language) => `translations.${language}.description`;
const namePluralPath = (language: Language) => `translations.${language}.name_plural`;

/** Persisted fields that an update explicitly removes (a `null` description, plural name or brand). */
const getUnsetFields = (data: UpdateIngredientData): string[] => {
	const removedFor = (field: 'description' | 'namePlural', toPath: (language: Language) => string) =>
		LANGUAGES.filter((language) => data.translations?.[language]?.[field] === null).map(toPath);
	const fields = [...removedFor('description', descriptionPath), ...removedFor('namePlural', namePluralPath)];
	return data.brand === null ? [...fields, 'brand'] : fields;
};

/** Applies the translations patch to the current translations, dropping the removed optional fields. */
const mergeTranslations = (
	current: IngredientPersistence['translations'],
	patch: Partial<IngredientPersistence['translations']> | undefined,
	unsetFields: string[],
): IngredientPersistence['translations'] =>
	LANGUAGES.reduce<IngredientPersistence['translations']>(
		(merged, language) => {
			const translation = { ...current[language], ...patch?.[language] };
			if (unsetFields.includes(descriptionPath(language))) delete translation.description;
			if (unsetFields.includes(namePluralPath(language))) delete translation.name_plural;
			return { ...merged, [language]: translation };
		},
		{} as IngredientPersistence['translations'],
	);

/** The category and the units are snapshots: they are stored without who created them (see `omitAuthorshipDeep`). */
const withoutSnapshotAuthorship = (data: Partial<IngredientPersistence>): Partial<IngredientPersistence> => ({
	...data,
	...(data.category && { category: omitAuthorshipDeep(data.category) }),
	...(data.units && { units: omitAuthorshipDeep(data.units) }),
});

export class IngredientsRepository implements IIngredientsRepository {
	async create(data: CreateIngredient): Promise<Ingredient> {
		try {
			const persistenceData = withoutSnapshotAuthorship(IngredientMapper.toPersistence(data));
			const document = await IngredientModel.create({
				...persistenceData,
				updated_by: persistenceData.created_by,
				...toSearchFields(
					buildIngredientSearchTiers(
						persistenceData.translations,
						persistenceData.brand,
						persistenceData.category?.translations,
					),
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
		const persistenceData = withoutSnapshotAuthorship(IngredientMapper.toPersistence(data));
		const update = toMongoUpdateSet(persistenceData);
		const unsetFields = getUnsetFields(data);
		// The keys come from the translations, the brand and the category, so a change of any of them rebuilds them.
		if (persistenceData.translations || data.brand !== undefined || persistenceData.category) {
			const current = await IngredientModel.findById(objectId)
				.select('translations brand category')
				.lean<Pick<IngredientPersistence, 'translations' | 'brand' | 'category'>>()
				.exec();
			if (!current) throw this.notFound('update');
			Object.assign(
				update,
				toSearchFields(
					buildIngredientSearchTiers(
						mergeTranslations(current.translations, persistenceData.translations, unsetFields),
						data.brand === undefined ? current.brand : (data.brand ?? undefined),
						(persistenceData.category ?? current.category).translations,
					),
				),
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

	async findAll(query: QueryParams, onlyIds?: string[]): Promise<Ingredient[]> {
		const persistenceQuery = IngredientMapper.toPersistenceQuery(query);
		const objectIds = onlyIds?.map(IngredientMapper.toObjectId).filter((id) => id !== null);
		const documents = await findPage<IngredientPersistence>(persistenceQuery, IngredientModel, {
			collation: getSortCollation(persistenceQuery.sort),
			ranked: true,
			...(objectIds && { filter: { _id: { $in: objectIds } } }),
		});
		return documents.map(IngredientMapper.toDomain);
	}

	async findAllOwnedFirst(query: QueryParams, userId: string): Promise<Ingredient[]> {
		const persistenceQuery = IngredientMapper.toPersistenceQuery(query);
		const documents = await findOwnedFirst<IngredientPersistence>(
			persistenceQuery,
			IngredientModel,
			userId,
			CREATED_BY_FIELD,
			{
				collation: getSortCollation(persistenceQuery.sort),
				ranked: true,
			},
		);
		return documents.map(IngredientMapper.toDomain);
	}

	clearCreatorByUser(userId: string): Promise<number> {
		return clearAuthorshipByUser(IngredientModel, userId);
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.ingredients.notFound', {
			path: 'Ingredients.repository',
			cause: `Ingredient missing during ${operation}`,
		});
	}
}
