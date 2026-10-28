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
import { RequestOwnershipTransferService } from './RequestOwnershipTransfer.service';

const service = new RequestOwnershipTransferService(
	resolveUsersRepository(),
	resolveCredentialsRepository(),
	resolveIdentitiesRepository(),
	resolveOwnershipTransferInvitationsRepository(),
	resolveAdministrativeEventsRepository(),
	resolveCryptoProvider(),
	resolveDateProvider(),
	resolveTransactionManager(),
	resolveTemplateProvider(),
	resolveEmailQueueProvider(),
);

export const resolveRequestOwnershipTransferService = () => service;
