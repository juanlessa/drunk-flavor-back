import { AuthenticateUserService } from "@/modules/accounts/useCases/authenticateUser/AuthenticateUser.service";
import { resolveEncryptionProvider } from "@/shared/providers/encryption";
import { resolveUsersRepository } from "@/modules/accounts/container";

const encryptionProvider = resolveEncryptionProvider();
const usersRepository = resolveUsersRepository();

const authenticateUserService = new AuthenticateUserService(
  usersRepository,
  encryptionProvider
);
export const resolveAuthenticateUserService = () => authenticateUserService;
