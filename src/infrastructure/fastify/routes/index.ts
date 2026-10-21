import { healthRoutes } from '../healthcheck/health.routes';
import { authRoutes } from './auth.routes';
import { categoriesRoutes } from './categories.routes';
import { ingredientsRoutes } from './ingredients.routes';
import { drinksRoutes } from './drinks.routes';
import { usersRoutes } from './users.routes';
import { profileRoutes } from './profile.routes';
import { unitsRoutes } from './units.routes';

export const router = [
	healthRoutes,
	authRoutes,
	profileRoutes,
	usersRoutes,
	categoriesRoutes,
	unitsRoutes,
	ingredientsRoutes,
	drinksRoutes,
];
