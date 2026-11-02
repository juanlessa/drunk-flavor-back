import {
	resolveAdministrativeEventsRepository,
	resolveOwnershipTransferInvitationsRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { CancelOwnershipTransferService } from './CancelOwnershipTransfer.service';

const service = new CancelOwnershipTransferService(
	resolveUsersRepository(),
	resolveOwnershipTransferInvitationsRepository(),
	resolveAdministrativeEventsRepository(),
	resolveTransactionManager(),
);

export const resolveCancelOwnershipTransferService = () => service;
