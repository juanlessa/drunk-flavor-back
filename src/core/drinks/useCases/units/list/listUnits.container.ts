import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { ListUnitsService } from './ListUnits.service';

const listUnitsService = new ListUnitsService(resolveUnitsRepository());
export const resolveListUnitsService = () => listUnitsService;
