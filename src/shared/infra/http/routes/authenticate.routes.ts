import { AuthenticateUserController } from '@modules/accounts/useCases/authenticateUser/AuthenticateUser.controller';
import { authenticateUserValidator } from '@modules/accounts/useCases/authenticateUser/authenticateUser.schema';
import { RefreshTokenController } from '@modules/accounts/useCases/refreshToken/RefreshToken.controller';
import { refreshTokenValidator } from '@modules/accounts/useCases/refreshToken/refreshToken.schema';
import { Router } from 'express';

const authenticateUserController = new AuthenticateUserController();
const refreshTokenController = new RefreshTokenController();

const authenticateRoutes = Router();

authenticateRoutes.post('/sessions', authenticateUserValidator, authenticateUserController.handle);
authenticateRoutes.post('/refresh-token', refreshTokenValidator, refreshTokenController.handle);

export default authenticateRoutes;
