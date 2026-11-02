import { EntityMetadata } from '@/shared/types/entity.types';
import { OwnershipTransferInvitation } from '../entities/ownershipTransferInvitation.entity';

export type CreateOwnershipTransferInvitation = Omit<OwnershipTransferInvitation, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateOwnershipTransferInvitation = Pick<OwnershipTransferInvitation, 'id'> &
	Partial<Omit<OwnershipTransferInvitation, keyof EntityMetadata>>;
