import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { ListUnitsWithAuthorshipService } from './ListUnitsWithAuthorship.service';

const unitsRepository = resolveUnitsRepository();

const listUnitsWithAuthorshipService = new ListUnitsWithAuthorshipService(unitsRepository);

export const resolveListUnitsWithAuthorshipService = () => listUnitsWithAuthorshipService;
