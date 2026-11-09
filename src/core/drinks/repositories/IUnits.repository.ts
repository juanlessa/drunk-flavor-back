import { CreateUnit, FindUnitByName, UpdateUnit } from '@/core/drinks/dtos/unit.dtos';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { QueryParams } from '@/shared/types/query.types';

export interface IUnitsRepository {
	create(data: CreateUnit): Promise<Unit>;
	update(data: UpdateUnit): Promise<Unit>;
	delete(id: string): Promise<Unit>;
	findByName(data: FindUnitByName): Promise<Unit | null>;
	findById(id: string): Promise<Unit | null>;
	findAll(query: QueryParams): Promise<Unit[]>;
	/** Like `findAll`, with the records created by `userId` first and the others after, each group in the order of the query. */
	findAllOwnedFirst(query: QueryParams, userId: string): Promise<Unit[]>;
	/** Removes the user as creator and last editor of the records, which stay as they are. Returns how many were touched. */
	clearCreatorByUser(userId: string): Promise<number>;
}
