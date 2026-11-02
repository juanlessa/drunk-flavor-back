import { randomUUID } from 'node:crypto';
import { CreateUnit, FindUnitByName, UpdateUnit } from '@/core/drinks/dtos/unit.dtos';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { QueryParams } from '@/shared/types/query.types';

export class UnitsRepositoryInMemory implements IUnitsRepository {
	collection: Unit[] = [];

	async create(data: CreateUnit): Promise<Unit> {
		const now = new Date();
		const record: Unit = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
		this.collection.push(record);
		return record;
	}

	async update({ id, symbol, spaceBeforeSymbol, ...data }: UpdateUnit): Promise<Unit> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('update');
		const record = { ...deepUpdate<Unit>(data, this.collection[index]), updatedAt: new Date() };
		if (symbol === null) delete record.symbol;
		else if (symbol !== undefined) record.symbol = symbol;
		if (spaceBeforeSymbol !== undefined) record.spaceBeforeSymbol = spaceBeforeSymbol;
		this.collection[index] = record;
		return record;
	}

	async delete(id: string): Promise<Unit> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('delete');
		return this.collection.splice(index, 1)[0];
	}

	async findByName(translations: FindUnitByName): Promise<Unit | null> {
		return this.collection.find((record) => compareTranslationsName(record.translations, translations)) ?? null;
	}

	async findById(id: string): Promise<Unit | null> {
		return this.collection.find((record) => record.id === id) ?? null;
	}

	async findAll(query: QueryParams): Promise<Unit[]> {
		let found = [...this.collection];
		if (query.search) found = filterItemsBySearchCriteria(found, query.search);
		if (query.sort) found = sortItemsByFields(found, query.sort);
		return paginateItems(found, query.limit || DEFAULT_QUERY_PARAMS.limit, query.page || DEFAULT_QUERY_PARAMS.page);
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.units.notFound', {
			path: 'UnitsInMemory.repository',
			cause: `Unit missing during ${operation}`,
		});
	}
}
