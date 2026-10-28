import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { OWNERSHIP_TRANSFER_INVITATION_SCOPE } from '@/core/accounts/constants/ownershipTransfer.constants';
import {
	OwnershipTransferAlreadyPendingError,
	OwnershipTransferInvitationNotFoundError,
} from '@/core/accounts/errors/ownershipTransfer.errors';
import {
	OWNERSHIP_TRANSFER_EXPIRES_AT_TTL_INDEX,
	OWNERSHIP_TRANSFER_SCOPE_UNIQUE_INDEX,
	OWNERSHIP_TRANSFER_TOKEN_UNIQUE_INDEX,
	OwnershipTransferInvitationModel,
} from '../entities/ownershipTransferInvitation.model';
import { OwnershipTransferInvitationsRepository } from './OwnershipTransferInvitations.repository';

type IndexInfo = {
	name: string;
	key: Record<string, number>;
	unique?: boolean;
	expireAfterSeconds?: number;
};

const expiresAt = new Date('2025-01-02T00:00:00.000Z');
const buildInvitation = (tokenHash = 'token-hash') => ({
	scope: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
	currentOwnerId: 'owner-id',
	targetUserId: 'target-id',
	tokenHash,
	reason: 'The current owner is transitioning operational responsibility',
	ownerSessionVersion: 2,
	targetSessionVersion: 3,
	expiresAt,
});

let repository: OwnershipTransferInvitationsRepository;

beforeAll(async () => {
	await OwnershipTransferInvitationModel.init();
});

beforeEach(() => {
	repository = new OwnershipTransferInvitationsRepository();
});

afterEach(async () => {
	await OwnershipTransferInvitationModel.deleteMany({});
});

describe('OwnershipTransferInvitationsRepository (integration)', () => {
	it('creates a snake_case document and returns the camelCase domain invitation', async () => {
		const invitation = await repository.create(buildInvitation());

		expect(invitation.id).toEqual(expect.any(String));
		expect(invitation).toMatchObject({
			currentOwnerId: 'owner-id',
			targetUserId: 'target-id',
			tokenHash: 'token-hash',
			ownerSessionVersion: 2,
			targetSessionVersion: 3,
			expiresAt,
		});
		expect(invitation.createdAt).toBeInstanceOf(Date);
		expect(invitation.updatedAt).toBeInstanceOf(Date);
		expect(invitation).not.toHaveProperty('token_hash');

		const persisted = await OwnershipTransferInvitationModel.findById(invitation.id).lean();
		expect(persisted).toMatchObject({
			current_owner_id: 'owner-id',
			target_user_id: 'target-id',
			token_hash: 'token-hash',
			owner_session_version: 2,
			target_session_version: 3,
			expires_at: expiresAt,
		});
	});

	it('enforces the singleton and maps duplicate-key races to a domain conflict', async () => {
		const results = await Promise.allSettled([
			repository.create(buildInvitation('first-token')),
			repository.create(buildInvitation('second-token')),
		]);

		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult;
		expect(rejected.reason).toBeInstanceOf(OwnershipTransferAlreadyPendingError);
		expect(await OwnershipTransferInvitationModel.countDocuments()).toBe(1);
	});

	it('finds the singleton and token hash and returns null for misses', async () => {
		const created = await repository.create(buildInvitation());

		expect((await repository.findSingleton())?.id).toBe(created.id);
		expect((await repository.findByTokenHash('token-hash'))?.id).toBe(created.id);
		expect(await repository.findByTokenHash('missing-token')).toBeNull();

		await repository.delete(created.id);
		expect(await repository.findSingleton()).toBeNull();
	});

	it('rotates token, session snapshots, and expiration on update', async () => {
		const created = await repository.create(buildInvitation());
		const nextExpiration = new Date('2025-01-03T00:00:00.000Z');

		const updated = await repository.update({
			id: created.id,
			tokenHash: 'rotated-token',
			ownerSessionVersion: 4,
			targetSessionVersion: 5,
			expiresAt: nextExpiration,
		});

		expect(updated).toMatchObject({
			id: created.id,
			tokenHash: 'rotated-token',
			ownerSessionVersion: 4,
			targetSessionVersion: 5,
			expiresAt: nextExpiration,
		});
		expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
	});

	it('rejects update and delete for invalid or missing ids', async () => {
		await expect(repository.update({ id: 'invalid-id', tokenHash: 'new-token' })).rejects.toBeInstanceOf(
			OwnershipTransferInvitationNotFoundError,
		);
		await expect(repository.delete('invalid-id')).rejects.toBeInstanceOf(OwnershipTransferInvitationNotFoundError);
		await expect(
			repository.update({ id: new ObjectId().toString(), tokenHash: 'new-token' }),
		).rejects.toBeInstanceOf(OwnershipTransferInvitationNotFoundError);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(
			OwnershipTransferInvitationNotFoundError,
		);
	});

	it('validates positive integer session snapshots', async () => {
		await expect(
			OwnershipTransferInvitationModel.create({
				scope: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
				current_owner_id: 'owner-id',
				target_user_id: 'target-id',
				token_hash: 'token-hash',
				reason: 'Valid reason',
				owner_session_version: 0,
				target_session_version: 1.5,
				expires_at: expiresAt,
			}),
		).rejects.toThrow();
	});

	it('declares singleton, token uniqueness, and absolute expiration indexes', async () => {
		const indexes = (await OwnershipTransferInvitationModel.collection.indexes()) as unknown as IndexInfo[];

		expect(OwnershipTransferInvitationModel.collection.collectionName).toBe('ownership_transfer_invitations');
		expect(indexes.find((index) => index.name === OWNERSHIP_TRANSFER_SCOPE_UNIQUE_INDEX)).toMatchObject({
			key: { scope: 1 },
			unique: true,
		});
		expect(indexes.find((index) => index.name === OWNERSHIP_TRANSFER_TOKEN_UNIQUE_INDEX)).toMatchObject({
			key: { token_hash: 1 },
			unique: true,
		});
		expect(indexes.find((index) => index.name === OWNERSHIP_TRANSFER_EXPIRES_AT_TTL_INDEX)).toMatchObject({
			key: { expires_at: 1 },
			expireAfterSeconds: 0,
		});
	});
});
