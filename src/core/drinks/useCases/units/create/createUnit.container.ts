import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { CreateUnitService } from './CreateUnit.service';

const createUnitService = new CreateUnitService(resolveUnitsRepository());
export const resolveCreateUnitService = () => createUnitService;
