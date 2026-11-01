import {
	resolveOwnershipTransferInvitationsRepository,
	resolveUsersRepository,
} from '@/core/accounts/infra/mongo/container';
import { GetPendingOwnershipTransferService } from './GetPendingOwnershipTransfer.service';

const service = new GetPendingOwnershipTransferService(
	resolveUsersRepository(),
	resolveOwnershipTransferInvitationsRepository(),
);

export const resolveGetPendingOwnershipTransferService = () => service;
