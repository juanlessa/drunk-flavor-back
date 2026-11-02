import { randomUUID } from 'node:crypto';
import {
	CreateOwnershipTransferInvitation,
	UpdateOwnershipTransferInvitation,
} from '@/core/accounts/dtos/ownershipTransferInvitation.dtos';
import { OwnershipTransferInvitation } from '@/core/accounts/entities/ownershipTransferInvitation.entity';
import {
	OwnershipTransferAlreadyPendingError,
	OwnershipTransferInvitationNotFoundError,
} from '@/core/accounts/errors/ownershipTransfer.errors';
import { IOwnershipTransferInvitationsRepository } from '../IOwnershipTransferInvitations.repository';

export class OwnershipTransferInvitationsRepositoryInMemory implements IOwnershipTransferInvitationsRepository {
	collection: OwnershipTransferInvitation[] = [];

	async create(data: CreateOwnershipTransferInvitation): Promise<OwnershipTransferInvitation> {
		if (this.collection.length > 0) {
			throw new OwnershipTransferAlreadyPendingError({
				path: 'OwnershipTransferInvitationsRepositoryInMemory.create',
			});
		}
		const now = new Date();
		const invitation: OwnershipTransferInvitation = {
			id: randomUUID(),
			...data,
			createdAt: now,
			updatedAt: now,
		};
		this.collection.push(invitation);
		return invitation;
	}

	async update({ id, ...data }: UpdateOwnershipTransferInvitation): Promise<OwnershipTransferInvitation> {
		const invitation = this.collection.find((candidate) => candidate.id === id);
		if (!invitation) {
			throw new OwnershipTransferInvitationNotFoundError({
				path: 'OwnershipTransferInvitationsRepositoryInMemory.update',
			});
		}
		Object.assign(invitation, data, { updatedAt: new Date() });
		return invitation;
	}

	async delete(id: string): Promise<void> {
		const index = this.collection.findIndex((candidate) => candidate.id === id);
		if (index < 0) {
			throw new OwnershipTransferInvitationNotFoundError({
				path: 'OwnershipTransferInvitationsRepositoryInMemory.delete',
			});
		}
		this.collection.splice(index, 1);
	}

	async findSingleton(): Promise<OwnershipTransferInvitation | null> {
		return this.collection[0] ?? null;
	}

	async findByTokenHash(tokenHash: string): Promise<OwnershipTransferInvitation | null> {
		return this.collection.find((invitation) => invitation.tokenHash === tokenHash) ?? null;
	}
}
