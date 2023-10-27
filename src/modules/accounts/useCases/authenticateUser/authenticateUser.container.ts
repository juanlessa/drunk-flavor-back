import { resolveUsersRepository, resolveUsersTokensRepository } from '@modules/accounts/container';
import { AuthenticateUserService } from '@modules/accounts/useCases/authenticateUser/AuthenticateUser.service';
import { resolveDateProvider } from '@shared/container/providers/date';
import { resolveJwtProvider } from '@shared/container/providers/jwt';
import { resolveEncryptionProvider } from '@shared/container/providers/encryption';

const dateProvider = resolveDateProvider();
const jwtProvider = resolveJwtProvider();
const encryptionProvider = resolveEncryptionProvider();
const usersRepository = resolveUsersRepository();
const usersTokensRepository = resolveUsersTokensRepository();

const authenticateUserService = new AuthenticateUserService(
	usersRepository,
	usersTokensRepository,
	dateProvider,
	jwtProvider,
	encryptionProvider
);
export const resolveAuthenticateUserService = () => authenticateUserService;
