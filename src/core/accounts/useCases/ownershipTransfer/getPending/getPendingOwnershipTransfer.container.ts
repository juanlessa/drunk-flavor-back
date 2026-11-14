import {
	resolveOwnershipTransferInvitationsRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { GetPendingOwnershipTransferService } from './GetPendingOwnershipTransfer.service';

const usersRepository = resolveUsersRepository();
const ownershipTransferInvitationsRepository = resolveOwnershipTransferInvitationsRepository();

const getPendingOwnershipTransferService = new GetPendingOwnershipTransferService(
	usersRepository,
	ownershipTransferInvitationsRepository,
);

export const resolveGetPendingOwnershipTransferService = () => getPendingOwnershipTransferService;
