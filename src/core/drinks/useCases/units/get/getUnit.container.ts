import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { GetUnitService } from './GetUnit.service';

const getUnitService = new GetUnitService(resolveUnitsRepository());
export const resolveGetUnitService = () => getUnitService;
