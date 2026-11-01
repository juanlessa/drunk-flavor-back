import { healthRoutes } from '../healthcheck/health.routes';
import { accountsModuleRoutes } from './accounts';
import { drinksModuleRoutes } from './drinks';
import { engagementModuleRoutes } from './engagement';

/** Infrastructure probes first, then each core module's routes. */
export const router = [healthRoutes, ...accountsModuleRoutes, ...drinksModuleRoutes, ...engagementModuleRoutes];
