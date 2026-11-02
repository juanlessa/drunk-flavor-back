import { administrationRoutes } from './administration.routes';
import { authRoutes } from './auth.routes';
import { profileRoutes } from './profile.routes';
import { usersRoutes } from './users.routes';

export const accountsModuleRoutes = [authRoutes, profileRoutes, administrationRoutes, usersRoutes];
