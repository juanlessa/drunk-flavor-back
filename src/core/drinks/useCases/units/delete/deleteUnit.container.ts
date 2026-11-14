import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { DeleteUnitService } from './DeleteUnit.service';

const unitsRepository = resolveUnitsRepository();

const deleteUnitService = new DeleteUnitService(unitsRepository);

export const resolveDeleteUnitService = () => deleteUnitService;
