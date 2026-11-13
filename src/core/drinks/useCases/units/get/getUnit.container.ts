import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { GetUnitService } from './GetUnit.service';

const unitsRepository = resolveUnitsRepository();

const getUnitService = new GetUnitService(unitsRepository);

export const resolveGetUnitService = () => getUnitService;
