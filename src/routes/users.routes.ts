import { Router } from 'express';
import { CreateUserController } from '@modules/accounts/useCases/createUser/CreateUserController';
import { ProfileUserController } from '@modules/accounts/useCases/profileUser/ProfileUserController';
import { ensureAuthenticated } from '@shared/middlewares/ensureAuthenticated';

const createUserController = new CreateUserController();
const profileUserController = new ProfileUserController();

const usersRoutes = Router();

usersRoutes.post('/', createUserController.handle);
usersRoutes.get('/profile', ensureAuthenticated, profileUserController.handle);

export default usersRoutes;
