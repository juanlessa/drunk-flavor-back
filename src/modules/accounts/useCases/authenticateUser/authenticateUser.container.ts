import { AuthenticateUserService } from '@modules/accounts/useCases/authenticateUser/AuthenticateUser.service';
import { resolveDateProvider } from '@shared/container/providers/date';
import { resolveJwtProvider } from '@shared/container/providers/jwt';
import { resolveEncryptionProvider } from '@shared/container/providers/encryption';
import { resolveUsersRepository } from '@modules/accounts/container';

const dateProvider = resolveDateProvider();
const jwtProvider = resolveJwtProvider();
const encryptionProvider = resolveEncryptionProvider();
const usersRepository = resolveUsersRepository();

const authenticateUserService = new AuthenticateUserService(
	usersRepository,
	dateProvider,
	jwtProvider,
	encryptionProvider
);
export const resolveAuthenticateUserService = () => authenticateUserService;
