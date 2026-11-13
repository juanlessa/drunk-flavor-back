import { Actor } from '@/shared/accessControl/actor.types';

export type GetPendingOwnershipTransferCommand = {
	actor: Actor;
};

/** Public view of the singleton invitation. The token hash and session snapshots never leave the service. */
export type PendingOwnershipTransfer = {
	targetUserId: string;
	reason: string;
	expiresAt: Date;
};
