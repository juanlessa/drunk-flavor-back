import {
	CreateOwnershipTransferInvitation,
	UpdateOwnershipTransferInvitation,
} from '@/core/accounts/dtos/ownershipTransferInvitation.dtos';
import { OwnershipTransferInvitation } from '@/core/accounts/entities/ownershipTransferInvitation.entity';
import {
	OwnershipTransferAlreadyPendingError,
	OwnershipTransferInvitationNotFoundError,
} from '@/core/accounts/errors/ownershipTransfer.errors';
import { IOwnershipTransferInvitationsRepository } from '@/core/accounts/repositories/IOwnershipTransferInvitations.repository';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import {
	OWNERSHIP_TRANSFER_SCOPE_UNIQUE_INDEX,
	OWNERSHIP_TRANSFER_TOKEN_UNIQUE_INDEX,
	OwnershipTransferInvitationModel,
	OwnershipTransferInvitationPersistence,
} from '../entities/ownershipTransferInvitation.model';
import { OwnershipTransferInvitationMapper } from '../mappers/ownershipTransferInvitation.mapper';

const UNIQUE_INDEXES = [OWNERSHIP_TRANSFER_SCOPE_UNIQUE_INDEX, OWNERSHIP_TRANSFER_TOKEN_UNIQUE_INDEX] as const;

export class OwnershipTransferInvitationsRepository implements IOwnershipTransferInvitationsRepository {
	async create(data: CreateOwnershipTransferInvitation): Promise<OwnershipTransferInvitation> {
		try {
			const document = await OwnershipTransferInvitationModel.create(
				OwnershipTransferInvitationMapper.toPersistence(data),
			);
			return OwnershipTransferInvitationMapper.toDomain(document);
		} catch (error) {
			if (isDuplicateKeyError(error, UNIQUE_INDEXES)) {
				throw new OwnershipTransferAlreadyPendingError({
					path: 'OwnershipTransferInvitations.repository.create',
				});
			}
			throw error;
		}
	}

	async update({ id, ...data }: UpdateOwnershipTransferInvitation): Promise<OwnershipTransferInvitation> {
		const objectId = OwnershipTransferInvitationMapper.toObjectId(id);
		if (!objectId) {
			throw new OwnershipTransferInvitationNotFoundError({
				path: 'OwnershipTransferInvitations.repository.update',
			});
		}

		let document: OwnershipTransferInvitationPersistence | null;
		try {
			document = await OwnershipTransferInvitationModel.findByIdAndUpdate(
				objectId,
				OwnershipTransferInvitationMapper.toPersistence(data),
				{ returnDocument: 'after', runValidators: true },
			)
				.lean<OwnershipTransferInvitationPersistence>()
				.exec();
		} catch (error) {
			if (isDuplicateKeyError(error, UNIQUE_INDEXES)) {
				throw new OwnershipTransferAlreadyPendingError({
					path: 'OwnershipTransferInvitations.repository.update',
				});
			}
			throw error;
		}
		if (!document) {
			throw new OwnershipTransferInvitationNotFoundError({
				path: 'OwnershipTransferInvitations.repository.update',
			});
		}
		return OwnershipTransferInvitationMapper.toDomain(document);
	}

	async delete(id: string): Promise<void> {
		const objectId = OwnershipTransferInvitationMapper.toObjectId(id);
		if (!objectId) {
			throw new OwnershipTransferInvitationNotFoundError({
				path: 'OwnershipTransferInvitations.repository.delete',
			});
		}
		const result = await OwnershipTransferInvitationModel.deleteOne({ _id: objectId }).exec();
		if (result.deletedCount === 0) {
			throw new OwnershipTransferInvitationNotFoundError({
				path: 'OwnershipTransferInvitations.repository.delete',
			});
		}
	}

	async findSingleton(): Promise<OwnershipTransferInvitation | null> {
		const document = await OwnershipTransferInvitationModel.findOne()
			.lean<OwnershipTransferInvitationPersistence>()
			.exec();
		return document ? OwnershipTransferInvitationMapper.toDomain(document) : null;
	}

	async findByTokenHash(tokenHash: string): Promise<OwnershipTransferInvitation | null> {
		const document = await OwnershipTransferInvitationModel.findOne({ token_hash: tokenHash })
			.lean<OwnershipTransferInvitationPersistence>()
			.exec();
		return document ? OwnershipTransferInvitationMapper.toDomain(document) : null;
	}
}
