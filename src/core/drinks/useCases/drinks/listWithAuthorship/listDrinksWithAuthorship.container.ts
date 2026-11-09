import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { ListDrinksWithAuthorshipService } from './ListDrinksWithAuthorship.service';

const listDrinksWithAuthorshipService = new ListDrinksWithAuthorshipService(
	resolveDrinksRepository(),
	resolveStorageProvider(),
);

export const resolveListDrinksWithAuthorshipService = () => listDrinksWithAuthorshipService;
