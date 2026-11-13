import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { UpdateUnitService } from './UpdateUnit.service';

const unitsRepository = resolveUnitsRepository();

const updateUnitService = new UpdateUnitService(unitsRepository);

export const resolveUpdateUnitService = () => updateUnitService;
