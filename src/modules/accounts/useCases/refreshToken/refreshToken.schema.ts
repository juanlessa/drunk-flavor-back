import { validateSchema } from '@middlewares/validateSchema';
import { IRefreshUserToken } from '@modules/accounts/dtos/usersTokens.dtos';
import { tokenValidation } from '@modules/accounts/validations/userToken.validations';
import { z } from 'zod';

const refreshTokenSchema = z.object({
	token: tokenValidation
});

export const refreshTokenValidator = validateSchema<IRefreshUserToken>(refreshTokenSchema);
