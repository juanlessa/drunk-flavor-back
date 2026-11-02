import {
	CreateOwnershipTransferInvitation,
	UpdateOwnershipTransferInvitation,
} from '../dtos/ownershipTransferInvitation.dtos';
import { OwnershipTransferInvitation } from '../entities/ownershipTransferInvitation.entity';

export interface IOwnershipTransferInvitationsRepository {
	create(data: CreateOwnershipTransferInvitation): Promise<OwnershipTransferInvitation>;
	update(data: UpdateOwnershipTransferInvitation): Promise<OwnershipTransferInvitation>;
	delete(id: string): Promise<void>;
	findSingleton(): Promise<OwnershipTransferInvitation | null>;
	findByTokenHash(tokenHash: string): Promise<OwnershipTransferInvitation | null>;
}
