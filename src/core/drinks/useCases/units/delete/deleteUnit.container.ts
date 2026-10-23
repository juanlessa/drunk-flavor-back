import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { DeleteUnitService } from './DeleteUnit.service';

const deleteUnitService = new DeleteUnitService(resolveUnitsRepository());
export const resolveDeleteUnitService = () => deleteUnitService;
