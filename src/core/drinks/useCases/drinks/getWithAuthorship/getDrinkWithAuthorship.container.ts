import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { GetDrinkWithAuthorshipService } from './GetDrinkWithAuthorship.service';

const getDrinkWithAuthorshipService = new GetDrinkWithAuthorshipService(
	resolveDrinksRepository(),
	resolveStorageProvider(),
);

export const resolveGetDrinkWithAuthorshipService = () => getDrinkWithAuthorshipService;
