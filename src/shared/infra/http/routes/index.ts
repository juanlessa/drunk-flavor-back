import { Router } from 'express';
import ingredientsRoutes from './ingredients.routes';
import drinksRoutes from './drinks.routes';
import usersRoutes from './users.routes';
import authenticateRoutes from './authenticate.routes';

const router = Router();

router.use('/ingredients', ingredientsRoutes);
router.use('/drinks', drinksRoutes);
router.use('/users', usersRoutes);
router.use(authenticateRoutes);

export default router;
