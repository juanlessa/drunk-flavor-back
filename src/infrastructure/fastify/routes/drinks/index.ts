import { categoriesRoutes } from './categories.routes';
import { drinksRoutes } from './drinks.routes';
import { ingredientsRoutes } from './ingredients.routes';
import { unitsRoutes } from './units.routes';

export const drinksModuleRoutes = [categoriesRoutes, unitsRoutes, ingredientsRoutes, drinksRoutes];
