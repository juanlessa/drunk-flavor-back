import { ensureAuthenticated } from '@shared/infra/http/middlewares/ensureAuthenticated';
import { isUserAdmin } from '@shared/infra/http/middlewares/isAdminUser';
import { CreateUserController } from '@modules/accounts/useCases/createUser/CreateUser.controller';
import { createUserValidator } from '@modules/accounts/useCases/createUser/createUser.schema';
import { DeleteUserController } from '@modules/accounts/useCases/deleteUser/DeleteUser.controller';
import { deleteUserValidator } from '@modules/accounts/useCases/deleteUser/deleteUser.schema';
import { ListUsersController } from '@modules/accounts/useCases/listUsers/ListUsers.controller';
import { ProfileUserController } from '@modules/accounts/useCases/profileUser/ProfileUser.controller';
import { UpdateUserController } from '@modules/accounts/useCases/updateUser/UpdateUser.controller';
import { updateUserValidator } from '@modules/accounts/useCases/updateUser/updateUser.schema';
import { UpdateUserRoleController } from '@modules/accounts/useCases/updateUserRole/UpdateUserRole.controller';
import { updateUserRoleValidator } from '@modules/accounts/useCases/updateUserRole/updateUserRole.schema';
import { Router } from 'express';

const createUserController = new CreateUserController();
const profileUserController = new ProfileUserController();
const deleteUserController = new DeleteUserController();
const updateUserController = new UpdateUserController();
const updateUserRoleController = new UpdateUserRoleController();
const listUsersController = new ListUsersController();

const usersRoutes = Router();

usersRoutes.post('/', ensureAuthenticated, isUserAdmin, createUserValidator, createUserController.handle);
usersRoutes.get('/', ensureAuthenticated, isUserAdmin, listUsersController.handle);
usersRoutes.get('/profile', ensureAuthenticated, profileUserController.handle);
usersRoutes.delete('/', ensureAuthenticated, isUserAdmin, deleteUserValidator, deleteUserController.handle);
usersRoutes.patch('/', ensureAuthenticated, updateUserValidator, updateUserController.handle);
usersRoutes.patch('/role', ensureAuthenticated, isUserAdmin, updateUserRoleValidator, updateUserRoleController.handle);

export default usersRoutes;
