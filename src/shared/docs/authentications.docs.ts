import { docsAuthenticateUser } from '@modules/accounts/useCases/authenticateUser/authenticateUser.docs';
import { docsRefreshToken } from '@modules/accounts/useCases/refreshToken/refreshToken.docs';

export const docsAuthenticationsPath = {
	'/sessions': {
		post: docsAuthenticateUser
	},
	'/refresh-token': {
		post: docsRefreshToken
	}
};
