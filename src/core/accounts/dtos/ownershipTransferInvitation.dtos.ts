import { OwnershipTransferInvitation } from '../entities/ownershipTransferInvitation.entity';

export type CreateOwnershipTransferInvitation = Omit<OwnershipTransferInvitation, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateOwnershipTransferInvitation = { id: string } & Partial<
	Pick<OwnershipTransferInvitation, 'tokenHash' | 'ownerSessionVersion' | 'targetSessionVersion' | 'expiresAt'>
>;
