import uploadConfig from '@config/upload';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';
import { CreateDrinkController } from '@modules/drinks/useCases/createDrink/CreateDrinkController';
import { DeleteDrinkController } from '@modules/drinks/useCases/deleteDrink/DeleteDrinkController';
import { GetDrinkController } from '@modules/drinks/useCases/getDrink/GetDrinkController';
import { ListDrinksController } from '@modules/drinks/useCases/listDrinks/ListDrinksController';
import { UpdateDrinkController } from '@modules/drinks/useCases/updateDrink/UpdateDrinkController';
import { UpdateDrinkCoverController } from '@modules/drinks/useCases/updateDrinkCover/UpdateDrinkCoverController';
import { UpdateDrinkThumbnailController } from '@modules/drinks/useCases/updateDrinkThumbnail/UpdateDrinkThumbnailController';
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

drinksRoutes.post('/', ensureAuthenticated, createDrinkController.handle);
drinksRoutes.get('/', listDrinksController.handle);
drinksRoutes.patch('/', ensureAuthenticated, updateDrinkController.handle);
drinksRoutes.delete('/', ensureAuthenticated, deleteDrinkController.handle);
drinksRoutes.get('/:id', getDrinkController.handle);
drinksRoutes.patch('/:id/cover', ensureAuthenticated, uploadImage.single('cover'), updateDrinkCoverController.handle);
drinksRoutes.patch(
	'/:id/thumbnail',
	ensureAuthenticated,
	uploadImage.single('thumbnail'),
	updateDrinkThumbnailController.handle
);

export default drinksRoutes;
