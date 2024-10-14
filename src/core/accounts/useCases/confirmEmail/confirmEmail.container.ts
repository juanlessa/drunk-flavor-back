import { resolveUsersRepository, resolveUserTokensRepository } from '@/core/accounts/infra/mongo/container';
import { ConfirmEmailService } from './ConfirmEmail.service';
import { resolveDateProvider } from '@/shared/providers/date';

const dateProvider = resolveDateProvider();
const usersRepository = resolveUsersRepository();
const userTokensRepository = resolveUserTokensRepository();

const confirmEmailService = new ConfirmEmailService(usersRepository, userTokensRepository, dateProvider);
export const resolveConfirmEmailService = () => confirmEmailService;
