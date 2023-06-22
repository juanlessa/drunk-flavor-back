import { Router } from 'express';
import { CreateUserController } from '@modules/accounts/useCases/createUser/CreateUserController';
import { ProfileUserController } from '@modules/accounts/useCases/profileUser/ProfileUserController';
import { ensureAuthenticated } from '@shared/infra/http/middlewares/ensureAuthenticated';
import { DeleteUserController } from '@modules/accounts/useCases/deleteUser/DeleteUserController';

const createUserController = new CreateUserController();
const profileUserController = new ProfileUserController();
const deleteUserController = new DeleteUserController();
const usersRoutes = Router();

usersRoutes.post('/', createUserController.handle);
usersRoutes.get('/profile', ensureAuthenticated, profileUserController.handle);
usersRoutes.delete('/', deleteUserController.handle);

export default usersRoutes;
