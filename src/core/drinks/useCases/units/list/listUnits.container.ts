import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { ListUnitsService } from './ListUnits.service';

const unitsRepository = resolveUnitsRepository();

const listUnitsService = new ListUnitsService(unitsRepository);

export const resolveListUnitsService = () => listUnitsService;
