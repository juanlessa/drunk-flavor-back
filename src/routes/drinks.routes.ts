import { Router } from 'express';
import multer from 'multer';
import { CreateDrinkController } from '@modules/drinks/useCases/createDrink/CreateDrinkController';
import { ListDrinksController } from '@modules/drinks/useCases/listDrinks/ListDrinksController';
import { GetDrinkController } from '@modules/drinks/useCases/getDrink/GetDrinkController';
import { UpdateDrinkCoverController } from '@modules/drinks/useCases/updateDrinkCover/UpdateDrinkCoverController';
import { UpdateDrinkThumbnailController } from '@modules/drinks/useCases/updateDrinkThumbnail/UpdateDrinkThumbnailController';
import { UpdateDrinkController } from '@modules/drinks/useCases/updateDrink/UpdateDrinkController';
import { DeleteDrinkController } from '@modules/drinks/useCases/deleteDrink/DeleteDrinkController';

import uploadConfig from '@config/upload';

const createDrinkController = new CreateDrinkController();
const listDrinksController = new ListDrinksController();
const getDrinkController = new GetDrinkController();
const updateDrinkCoverController = new UpdateDrinkCoverController();
const updateDrinkThumbnailController = new UpdateDrinkThumbnailController();
const updateDrinkController = new UpdateDrinkController();
const deleteDrinkController = new DeleteDrinkController();

const drinksRoutes = Router();
const uploadImage = multer(uploadConfig.upload());

drinksRoutes.post('/', createDrinkController.handle);
drinksRoutes.get('/', listDrinksController.handle);
drinksRoutes.patch('/', updateDrinkController.handle);
drinksRoutes.delete('/', deleteDrinkController.handle);
drinksRoutes.get('/:id', getDrinkController.handle);
drinksRoutes.patch('/:id/cover', uploadImage.single('cover'), updateDrinkCoverController.handle);
drinksRoutes.patch('/:id/thumbnail', uploadImage.single('thumbnail'), updateDrinkThumbnailController.handle);

export default drinksRoutes;
