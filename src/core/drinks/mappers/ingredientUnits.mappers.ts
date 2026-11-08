import { Unit } from '@/core/drinks/entities/unit.entity';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { BadRequestError } from '@/shared/error/error.lib';

/**
 * Resolves a list of unit ids into full unit snapshots, preserving the given order.
 * Throws when any id does not exist. An empty list yields an empty list (not measurable).
 */
export const resolveIngredientUnits = async (
	unitIds: string[],
	unitsRepository: IUnitsRepository,
	path: string,
): Promise<Unit[]> => {
	if (unitIds.length === 0) return [];
	const units = await Promise.all(unitIds.map((unitId) => unitsRepository.findById(unitId)));
	const resolved = units.filter((unit): unit is Unit => unit !== null);
	if (resolved.length !== unitIds.length) {
		throw new BadRequestError('apiResponses.ingredients.someUnitsNotExist', { path });
	}
	return resolved;
};
