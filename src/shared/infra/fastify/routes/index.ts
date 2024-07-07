import { authenticateRoutes } from './authenticate.routes';
import { categoriesRoutes } from './categories.routes';
import { usersRoutes } from './users.routes';

export const router = [authenticateRoutes, usersRoutes, categoriesRoutes];
