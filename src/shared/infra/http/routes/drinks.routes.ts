import uploadConfig from '@config/upload';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';
import { CreateDrinkController } from '@modules/drinks/useCases/createDrink/CreateDrink.controller';
import { createDrinkValidator } from '@modules/drinks/useCases/createDrink/createDrink.schema';
import { DeleteDrinkController } from '@modules/drinks/useCases/deleteDrink/DeleteDrink.controller';
import { deleteDrinkValidator } from '@modules/drinks/useCases/deleteDrink/deleteDrink.schema';
import { GetDrinkController } from '@modules/drinks/useCases/getDrink/GetDrink.controller';
import { ListDrinksController } from '@modules/drinks/useCases/listDrinks/ListDrinks.controller';
import { UpdateDrinkController } from '@modules/drinks/useCases/updateDrink/UpdateDrink.controller';
import { updateDrinkValidator } from '@modules/drinks/useCases/updateDrink/updateDrink.schema';
import { UpdateDrinkCoverController } from '@modules/drinks/useCases/updateDrinkCover/UpdateDrinkCover.controller';
import { UpdateDrinkThumbnailController } from '@modules/drinks/useCases/updateDrinkThumbnail/UpdateDrinkThumbnail.controller';
import { Router } from 'express';
import multer from 'multer';

const createDrinkController = new CreateDrinkController();
const listDrinksController = new ListDrinksController();
const getDrinkController = new GetDrinkController();
const updateDrinkCoverController = new UpdateDrinkCoverController();
const updateDrinkThumbnailController = new UpdateDrinkThumbnailController();
const updateDrinkController = new UpdateDrinkController();
const deleteDrinkController = new DeleteDrinkController();

const drinksRoutes = Router();
const uploadImage = multer(uploadConfig.upload());

drinksRoutes.post('/', createDrinkValidator, createDrinkController.handle);
drinksRoutes.get('/', listDrinksController.handle);
drinksRoutes.patch('/', updateDrinkValidator, updateDrinkController.handle);
drinksRoutes.delete('/', deleteDrinkValidator, deleteDrinkValidator, deleteDrinkController.handle);
drinksRoutes.get('/:id', getDrinkController.handle);
drinksRoutes.patch('/:id/cover', uploadImage.single('cover'), updateDrinkCoverController.handle);
drinksRoutes.patch('/:id/thumbnail', uploadImage.single('thumbnail'), updateDrinkThumbnailController.handle);

export default drinksRoutes;
