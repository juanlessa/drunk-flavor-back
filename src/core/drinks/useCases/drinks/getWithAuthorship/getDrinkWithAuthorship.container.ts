import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { GetDrinkWithAuthorshipService } from './GetDrinkWithAuthorship.service';

const drinksRepository = resolveDrinksRepository();
const storageProvider = resolveStorageProvider();

const getDrinkWithAuthorshipService = new GetDrinkWithAuthorshipService(drinksRepository, storageProvider);

export const resolveGetDrinkWithAuthorshipService = () => getDrinkWithAuthorshipService;
