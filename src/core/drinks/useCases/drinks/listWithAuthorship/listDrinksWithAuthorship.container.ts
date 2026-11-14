import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { ListDrinksWithAuthorshipService } from './ListDrinksWithAuthorship.service';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();

const listDrinksWithAuthorshipService = new ListDrinksWithAuthorshipService(drinksRepository, storageProvider);

export const resolveListDrinksWithAuthorshipService = () => listDrinksWithAuthorshipService;
