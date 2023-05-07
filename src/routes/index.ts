import { Router } from "express";
import ingredientsRoutes from './ingredients.routes'
import drinksRoutes from './drinks.routes'


const router = Router();

router.use("/ingredients", ingredientsRoutes);
router.use("/drinks", drinksRoutes);

export default router;