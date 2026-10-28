import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { TokenMapper } from './token.mapper';
import { TokenPersistence } from '../entities/token.model';

const buildPersistence = (): TokenPersistence => ({
	_id: new Types.ObjectId(),
	user_id: new Types.ObjectId().toHexString(),
	token_hash: 'token-hash',
	type: 'email-verification',
	expires_at: new Date('2030-01-01T00:00:00.000Z'),
	created_at: new Date('2024-01-01T00:00:00.000Z'),
	updated_at: new Date('2024-01-02T00:00:00.000Z'),
});

describe('TokenMapper', () => {
	it('maps persistence data to a camelCase Token', () => {
		const persistence = buildPersistence();
		expect(TokenMapper.toDomain(persistence)).toEqual({
			id: persistence._id.toHexString(),
			userId: persistence.user_id,
			tokenHash: 'token-hash',
			type: 'email-verification',
			expiresAt: persistence.expires_at,
			createdAt: persistence.created_at,
			updatedAt: persistence.updated_at,
		});
	});

	it('maps partial domain data to snake_case persistence data', () => {
		const expiresAt = new Date('2030-01-01T00:00:00.000Z');
		expect(TokenMapper.toPersistence({ userId: 'user-id', tokenHash: 'hash', expiresAt })).toEqual({
			user_id: 'user-id',
			token_hash: 'hash',
			expires_at: expiresAt,
		});
	});
});
