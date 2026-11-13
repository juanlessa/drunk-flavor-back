import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { GetUnitWithAuthorshipService } from './GetUnitWithAuthorship.service';

const unitsRepository = resolveUnitsRepository();

const getUnitWithAuthorshipService = new GetUnitWithAuthorshipService(unitsRepository);

export const resolveGetUnitWithAuthorshipService = () => getUnitWithAuthorshipService;
