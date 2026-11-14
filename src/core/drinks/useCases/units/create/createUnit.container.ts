import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { CreateUnitService } from './CreateUnit.service';

const unitsRepository = resolveUnitsRepository();

const createUnitService = new CreateUnitService(unitsRepository);

export const resolveCreateUnitService = () => createUnitService;
