import { Router } from 'express';
import authenticateRoutes from './authenticate.routes';
import drinksRoutes from './drinks.routes';
import ingredientsRoutes from './ingredients.routes';
import categoriesRoutes from './categories.routes';
import usersRoutes from './users.routes';

const router = Router();

router.use('/ingredients', ingredientsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/drinks', drinksRoutes);
router.use('/users', usersRoutes);
router.use(authenticateRoutes);

export default router;
