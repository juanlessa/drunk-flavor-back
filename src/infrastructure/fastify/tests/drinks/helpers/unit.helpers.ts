import { CreateUnit } from '@/core/drinks/dtos/unit.dtos';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { DeepPartial } from '@/shared/types/utility.types';

export const createUnit = async (unitOptions?: DeepPartial<CreateUnit>) => {
	const unitData = createUnitFactory(unitOptions);
	const unit = await resolveUnitsRepository().create(unitData);
	return { ...unitData, id: unit.id, unit };
};
