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
import { AcceptOwnershipTransferService } from './AcceptOwnershipTransfer.service';

const service = new AcceptOwnershipTransferService(
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

export const resolveAcceptOwnershipTransferService = () => service;
