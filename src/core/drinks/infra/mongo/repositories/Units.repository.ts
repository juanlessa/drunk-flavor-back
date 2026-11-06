import { CreateUnit, FindUnitByName, UpdateUnit } from '@/core/drinks/dtos/unit.dtos';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { toMongoUpdateSet } from '@/infrastructure/mongo/helpers/mapper.helpers';
import { mapDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { SEARCH_KEYS_FIELD } from '@/infrastructure/mongo/constants/search.constants';
import { UNIT_PERSISTENCE_SEARCH_FIELDS, buildTranslationsSearchKeys } from '@/core/drinks/helpers/searchKeys.helpers';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { UNIT_UNIQUE_INDEXES, UnitModel, UnitPersistence } from '../entities/unit.model';
import { findByTranslatedName, getSortCollation } from '../helpers/translations.helpers';
import { UnitMapper } from '../mappers/unit.mapper';

export class UnitsRepository implements IUnitsRepository {
	async create(data: CreateUnit): Promise<Unit> {
		try {
			const persistenceData = UnitMapper.toPersistence(data);
			const document = await UnitModel.create({
				...persistenceData,
				search_keys: buildTranslationsSearchKeys(persistenceData.translations, UNIT_PERSISTENCE_SEARCH_FIELDS, [
					persistenceData.symbol,
				]),
			});
			return UnitMapper.toDomain(document);
		} catch (error) {
			throw mapDuplicateKeyError(error, UNIT_UNIQUE_INDEXES, 'apiResponses.units.alreadyExist', {
				path: 'Units.repository',
			});
		}
	}

	async update({ id, symbol, ...data }: UpdateUnit): Promise<Unit> {
		const objectId = UnitMapper.toObjectId(id);
		if (!objectId) throw this.notFound('update');
		const unitData = UnitMapper.toPersistence(data);
		const persistenceData = toMongoUpdateSet(unitData);
		if (unitData.translations || symbol !== undefined) {
			const current = await UnitModel.findById(objectId)
				.select('translations symbol')
				.lean<Pick<UnitPersistence, 'translations' | 'symbol'>>()
				.exec();
			if (!current) throw this.notFound('update');
			persistenceData[SEARCH_KEYS_FIELD] = buildTranslationsSearchKeys(
				unitData.translations ? deepUpdate(unitData.translations, current.translations) : current.translations,
				UNIT_PERSISTENCE_SEARCH_FIELDS,
				[symbol === undefined ? current.symbol : symbol],
			);
		}
		const update =
			symbol === null
				? { $set: persistenceData, $unset: { symbol: 1 } }
				: { $set: symbol === undefined ? persistenceData : { ...persistenceData, symbol } };
		let document: UnitPersistence | null;
		try {
			document = await UnitModel.findByIdAndUpdate(objectId, update, {
				returnDocument: 'after',
				runValidators: true,
			})
				.lean<UnitPersistence>()
				.exec();
		} catch (error) {
			throw mapDuplicateKeyError(error, UNIT_UNIQUE_INDEXES, 'apiResponses.units.alreadyExist', {
				path: 'Units.repository',
			});
		}
		if (!document) throw this.notFound('update');
		return UnitMapper.toDomain(document);
	}

	async delete(id: string): Promise<Unit> {
		const objectId = UnitMapper.toObjectId(id);
		if (!objectId) throw this.notFound('delete');
		const document = await UnitModel.findByIdAndDelete(objectId).lean<UnitPersistence>().exec();
		if (!document) throw this.notFound('delete');
		return UnitMapper.toDomain(document);
	}

	async findByName(data: FindUnitByName): Promise<Unit | null> {
		const document = await findByTranslatedName(data, (filter, collation) =>
			UnitModel.findOne(filter).collation(collation).lean<UnitPersistence>().exec(),
		);
		return document ? UnitMapper.toDomain(document) : null;
	}

	async findById(id: string): Promise<Unit | null> {
		const objectId = UnitMapper.toObjectId(id);
		if (!objectId) return null;
		const document = await UnitModel.findById(objectId).lean<UnitPersistence>().exec();
		return document ? UnitMapper.toDomain(document) : null;
	}

	async findAll(query: QueryParams): Promise<Unit[]> {
		const persistenceQuery = UnitMapper.toPersistenceQuery(query);
		const documents = await buildQuery<UnitPersistence>(persistenceQuery, UnitModel, {
			collation: getSortCollation(persistenceQuery.sort),
		})
			.lean<UnitPersistence[]>()
			.exec();
		return documents.map(UnitMapper.toDomain);
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.units.notFound', {
			path: 'Units.repository',
			cause: `Unit missing during ${operation}`,
		});
	}
}
