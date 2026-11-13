import {
	resolveAdministrativeEventsRepository,
	resolveOwnershipTransferInvitationsRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { CancelOwnershipTransferService } from './CancelOwnershipTransfer.service';

const usersRepository = resolveUsersRepository();
const ownershipTransferInvitationsRepository = resolveOwnershipTransferInvitationsRepository();
const administrativeEventsRepository = resolveAdministrativeEventsRepository();
const transactionManager = resolveTransactionManager();

const cancelOwnershipTransferService = new CancelOwnershipTransferService(
	usersRepository,
	ownershipTransferInvitationsRepository,
	administrativeEventsRepository,
	transactionManager,
);

export const resolveCancelOwnershipTransferService = () => cancelOwnershipTransferService;
