import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { ListUnitsWithAuthorshipService } from './ListUnitsWithAuthorship.service';

const listUnitsWithAuthorshipService = new ListUnitsWithAuthorshipService(resolveUnitsRepository());

export const resolveListUnitsWithAuthorshipService = () => listUnitsWithAuthorshipService;
