import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { UpdateUnitService } from './UpdateUnit.service';

const updateUnitService = new UpdateUnitService(resolveUnitsRepository());
export const resolveUpdateUnitService = () => updateUnitService;
