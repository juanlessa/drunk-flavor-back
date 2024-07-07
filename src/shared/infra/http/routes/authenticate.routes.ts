import { AuthenticateUserController } from '@modules/accounts/useCases/authenticateUser/AuthenticateUser.controller';
import { authenticateUserValidator } from '@modules/accounts/useCases/authenticateUser/authenticateUser.schema';
import { Router } from 'express';

const authenticateUserController = new AuthenticateUserController();

const authenticateRoutes = Router();

authenticateRoutes.post('/sessions', authenticateUserValidator, authenticateUserController.handle);

export default authenticateRoutes;
