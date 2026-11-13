import {
	resolveCategoriesRepository,
	resolveDrinksRepository,
	resolveIngredientsRepository,
	resolveUnitsRepository,
} from '@/core/drinks/infra/mongo/container';
import { ClearCreatorByUserService } from './ClearCreatorByUser.service';

const clearCreatorByUserService = new ClearCreatorByUserService(
	resolveDrinksRepository(),
	resolveIngredientsRepository(),
	resolveCategoriesRepository(),
	resolveUnitsRepository(),
);

export const resolveClearCreatorByUserService = () => clearCreatorByUserService;
