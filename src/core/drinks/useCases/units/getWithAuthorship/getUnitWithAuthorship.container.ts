import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { GetUnitWithAuthorshipService } from './GetUnitWithAuthorship.service';

const getUnitWithAuthorshipService = new GetUnitWithAuthorshipService(resolveUnitsRepository());

export const resolveGetUnitWithAuthorshipService = () => getUnitWithAuthorshipService;
