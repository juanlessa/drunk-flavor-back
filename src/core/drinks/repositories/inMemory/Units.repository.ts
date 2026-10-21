import { CreateUnit, FindUnitByName, UpdateUnit } from '@/core/drinks/dtos/unit.dtos';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { QueryParams } from '@/shared/types/query.types';
import { ObjectId } from 'mongodb';

export class UnitsRepositoryInMemory implements IUnitsRepository {
	collection: Unit[] = [];

	async create(data: CreateUnit): Promise<Unit> {
		const record: Unit = {
			_id: new ObjectId(),
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateUnit): Promise<Unit> {
		const recordIndex = this.collection.findIndex((record) => record._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.units.notFound', {
				path: 'UnitsInMemory.repository',
				cause: 'Error on findByIdAndUpdate operation',
			});
		}
		let record = this.collection[recordIndex];
		record = deepUpdate<Unit>(data, record);
		if (data.symbol !== undefined) record.symbol = data.symbol;
		if (data.space_before_symbol !== undefined) record.space_before_symbol = data.space_before_symbol;
		record.updated_at = new Date();
		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<Unit> {
		const recordIndex = this.collection.findIndex((record) => record._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.units.notFound', {
				path: 'UnitsInMemory.repository',
				cause: 'Error on findByIdAndDelete operation',
			});
		}
		const [deletedRecord] = this.collection.splice(recordIndex, 1);
		return deletedRecord;
	}

	async findByName(translations: FindUnitByName): Promise<Unit | null> {
		return this.collection.find((record) => compareTranslationsName(record.translations, translations)) || null;
	}

	async findById(id: string): Promise<Unit | null> {
		return this.collection.find((record) => record._id.toString() === id) || null;
	}

	async findAll(query: QueryParams): Promise<Unit[]> {
		let found = [...this.collection];
		if (query.search) found = filterItemsBySearchCriteria(found, query.search);
		if (query.sort) found = sortItemsByFields(found, query.sort);
		return paginateItems(found, query.limit || DEFAULT_QUERY_PARAMS.limit, query.page || DEFAULT_QUERY_PARAMS.page);
	}
}
