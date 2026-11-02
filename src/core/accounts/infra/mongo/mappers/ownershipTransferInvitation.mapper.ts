import { OwnershipTransferInvitation } from '@/core/accounts/entities/ownershipTransferInvitation.entity';
import { OwnershipTransferInvitationPersistence } from '../entities/ownershipTransferInvitation.model';
import {
	mapObjectEntriesDeep,
	toDomainEntry,
	toObjectId,
	toPersistenceEntry,
	toPlainObject,
} from '@/infrastructure/mongo/helpers/mapper.helpers';

export const OwnershipTransferInvitationMapper = {
	toDomain(document: OwnershipTransferInvitationPersistence): OwnershipTransferInvitation {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, {
			nullHandling: 'toUndefined',
		}) as OwnershipTransferInvitation;
	},
	toPersistence(data: Partial<OwnershipTransferInvitation>): Partial<OwnershipTransferInvitationPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<OwnershipTransferInvitationPersistence>;
	},
	toObjectId,
};
