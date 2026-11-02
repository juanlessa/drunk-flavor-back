import { describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';
import { CredentialMapper } from './credential.mapper';
import { CredentialPersistence } from '../entities/credential.model';

const buildPersistence = (): CredentialPersistence => ({
	_id: new Types.ObjectId(),
	user_id: new Types.ObjectId().toHexString(),
	password_hash: 'hashed-password',
	created_at: new Date('2024-01-01T00:00:00.000Z'),
	updated_at: new Date('2024-01-02T00:00:00.000Z'),
});

describe('CredentialMapper', () => {
	it('maps hydrated persistence data to a camelCase Credential', () => {
		const persistence = buildPersistence();
		const toObject = vi.fn(() => ({ ...persistence, __v: 1 }));
		const credential = CredentialMapper.toDomain({ toObject } as unknown as CredentialPersistence);
		expect(credential).toEqual({
			id: persistence._id.toHexString(),
			userId: persistence.user_id,
			passwordHash: persistence.password_hash,
			createdAt: persistence.created_at,
			updatedAt: persistence.updated_at,
		});
		expect(toObject).toHaveBeenCalledOnce();
	});

	it('maps partial domain data to snake_case persistence data', () => {
		expect(CredentialMapper.toPersistence({ userId: 'user-id', passwordHash: 'hash' })).toEqual({
			user_id: 'user-id',
			password_hash: 'hash',
		});
	});
});
