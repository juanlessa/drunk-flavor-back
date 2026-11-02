import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { IdentityMapper } from './identity.mapper';
import { IdentityPersistence } from '../entities/identity.model';

const buildPersistence = (): IdentityPersistence => ({
	_id: new Types.ObjectId(),
	user_id: new Types.ObjectId().toHexString(),
	provider: 'google',
	provider_sub: 'google-subject',
	email: 'user@example.com',
	email_verified: true,
	picture_url: 'https://example.com/avatar.png',
	last_login_at: new Date('2024-01-03T00:00:00.000Z'),
	created_at: new Date('2024-01-01T00:00:00.000Z'),
	updated_at: new Date('2024-01-02T00:00:00.000Z'),
});

describe('IdentityMapper', () => {
	it('maps persistence data to a camelCase Identity', () => {
		const persistence = buildPersistence();
		const identity = IdentityMapper.toDomain(persistence);
		expect(identity).toEqual({
			id: persistence._id.toHexString(),
			userId: persistence.user_id,
			provider: 'google',
			providerSubject: 'google-subject',
			email: 'user@example.com',
			isEmailVerified: true,
			pictureUrl: 'https://example.com/avatar.png',
			lastLoginAt: persistence.last_login_at,
			createdAt: persistence.created_at,
			updatedAt: persistence.updated_at,
		});
	});

	it('maps camelCase identity data to the snake_case document shape', () => {
		expect(
			IdentityMapper.toPersistence({
				userId: 'user-id',
				provider: 'google',
				providerSubject: 'google-subject',
				isEmailVerified: true,
				pictureUrl: 'https://example.com/avatar.png',
			}),
		).toEqual({
			user_id: 'user-id',
			provider: 'google',
			provider_sub: 'google-subject',
			email_verified: true,
			picture_url: 'https://example.com/avatar.png',
		});
	});
});
