import { EntityMetadata } from '@/shared/types/entity.types';
import { OWNERSHIP_TRANSFER_INVITATION_SCOPE } from '../constants/ownershipTransfer.constants';

export type OwnershipTransferInvitation = EntityMetadata & {
	scope: typeof OWNERSHIP_TRANSFER_INVITATION_SCOPE;
	currentOwnerId: string;
	targetUserId: string;
	tokenHash: string;
	reason: string;
	ownerSessionVersion: number;
	targetSessionVersion: number;
	expiresAt: Date;
};
