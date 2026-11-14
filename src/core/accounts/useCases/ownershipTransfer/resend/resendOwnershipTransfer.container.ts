import {
	resolveAdministrativeEventsRepository,
	resolveCredentialsRepository,
	resolveIdentitiesRepository,
	resolveOwnershipTransferInvitationsRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { resolveCryptoProvider } from '@/shared/providers/cryptography';
import { resolveDateProvider } from '@/shared/providers/date';
import { resolveEmailQueueProvider } from '@/shared/providers/queue/email';
import { resolveTemplateProvider } from '@/shared/providers/template';
import { ResendOwnershipTransferService } from './ResendOwnershipTransfer.service';

const usersRepository = resolveUsersRepository();
const credentialsRepository = resolveCredentialsRepository();
const identitiesRepository = resolveIdentitiesRepository();
const ownershipTransferInvitationsRepository = resolveOwnershipTransferInvitationsRepository();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();
const cryptoProvider = resolveCryptoProvider();
const dateProvider = resolveDateProvider();
const transactionManager = resolveTransactionManager();
const templateProvider = resolveTemplateProvider();
const emailQueueProvider = resolveEmailQueueProvider();

const resendOwnershipTransferService = new ResendOwnershipTransferService(
	usersRepository,
	credentialsRepository,
	identitiesRepository,
	ownershipTransferInvitationsRepository,
	administrativeEventsRepository,
	cryptoProvider,
	dateProvider,
	transactionManager,
	templateProvider,
	emailQueueProvider,
);

export const resolveResendOwnershipTransferService = () => resendOwnershipTransferService;
