import { docsAuthenticateUser } from '@modules/accounts/useCases/authenticateUser/authenticateUser.docs';

export const docsAuthenticationsPath = {
	'/sessions': {
		post: docsAuthenticateUser
	}
};
