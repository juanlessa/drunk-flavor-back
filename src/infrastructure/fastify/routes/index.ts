import { authRoutes } from './auth.routes';
import { categoriesRoutes } from './categories.routes';
import { ingredientsRoutes } from './ingredients.routes';
import { drinksRoutes } from './drinks.routes';
import { usersRoutes } from './users.routes';

export const router = [authRoutes, usersRoutes, categoriesRoutes, ingredientsRoutes, drinksRoutes];
