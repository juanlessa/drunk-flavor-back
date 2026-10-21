import { CreateUnit, FindUnitByName, UpdateUnit } from '@/core/drinks/dtos/unit.dtos';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { removeLeanVersionKey } from '@/infrastructure/mongo/helpers/mongoose.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { UnitModel } from '../entities/unit.model';
import { getNameCompareQuery } from '../helpers/translations.helpers';

export class UnitsRepository implements IUnitsRepository {
	async create(data: CreateUnit): Promise<Unit> {
		return UnitModel.create(data);
	}

	async update({ id, ...data }: UpdateUnit): Promise<Unit> {
		const unit = await UnitModel.findByIdAndUpdate<Unit>(id, data, { returnDocument: 'after' }).exec();
		if (!unit) {
			throw new NotFoundError('apiResponses.units.notFound', {
				path: 'Units.repository',
				cause: 'Error on findByIdAndUpdate operation',
			});
		}
		return unit;
	}

	async delete(id: string): Promise<Unit> {
		const unit = await UnitModel.findByIdAndDelete<Unit>(id).exec();
		if (!unit) {
			throw new NotFoundError('apiResponses.units.notFound', {
				path: 'Units.repository',
				cause: 'Error on findOneAndDelete operation',
			});
		}
		return unit;
	}

	async findByName(data: FindUnitByName): Promise<Unit | null> {
		return UnitModel.findOne<Unit>({ $or: getNameCompareQuery(data) })
			.lean<Unit>({ transform: removeLeanVersionKey })
			.exec();
	}

	async findById(id: string): Promise<Unit | null> {
		return UnitModel.findById<Unit>(id).lean<Unit>({ transform: removeLeanVersionKey }).exec();
	}

	async findAll(query: QueryParams): Promise<Unit[]> {
		return buildQuery<Unit>(query, UnitModel).lean<Unit[]>({ transform: removeLeanVersionKey }).exec();
	}
}
