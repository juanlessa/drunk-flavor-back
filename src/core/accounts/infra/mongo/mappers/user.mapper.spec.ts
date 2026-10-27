import { describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';
import { UserMapper } from './user.mapper';
import { UserPersistence } from '../entities/user.model';

const buildUserPersistence = (overrides: Partial<UserPersistence> = {}): UserPersistence => ({
	_id: new Types.ObjectId(),
	name: 'Jane',
	surname: 'Doe',
	email: 'jane@example.com',
	email_verified: true,
	avatar_url: 'https://example.com/avatar.png',
	role: 'member',
	status: 'active',
	created_at: new Date('2024-01-01T00:00:00.000Z'),
	updated_at: new Date('2024-01-02T00:00:00.000Z'),
	...overrides,
});

describe('UserMapper', () => {
	it('maps a persistence object to a camelCase User and normalizes null values', () => {
		const persistence = buildUserPersistence({ name: null, avatar_url: null });
		const user = UserMapper.toDomain({ ...persistence, __v: 1, $locals: { hidden: true } } as UserPersistence);

		expect(user).toEqual({
			id: persistence._id.toHexString(),
			name: undefined,
			surname: 'Doe',
			email: 'jane@example.com',
			emailVerified: true,
			avatarUrl: undefined,
			role: 'member',
			status: 'active',
			createdAt: persistence.created_at,
			updatedAt: persistence.updated_at,
		});
		expect(user).not.toHaveProperty('__v');
		expect(user).not.toHaveProperty('$locals');
	});

	it('uses toObject for hydrated documents before mapping', () => {
		const persistence = buildUserPersistence();
		const toObject = vi.fn(() => ({ ...persistence, __v: 2 }));
		const user = UserMapper.toDomain({ toObject, $locals: { hidden: true } } as unknown as UserPersistence);

		expect(toObject).toHaveBeenCalledWith({ getters: false, virtuals: false, versionKey: false });
		expect(user.id).toBe(persistence._id.toHexString());
		expect(user).not.toHaveProperty('__v');
		expect(user).not.toHaveProperty('$locals');
	});

	it('maps a partial User to snake_case persistence data and omits nullish values', () => {
		const id = new Types.ObjectId();
		const persistence = UserMapper.toPersistence({
			id: id.toHexString(),
			emailVerified: true,
			avatarUrl: null as never,
			name: undefined,
		});

		expect(persistence._id).toBeInstanceOf(Types.ObjectId);
		expect(persistence.email_verified).toBe(true);
		expect(persistence).not.toHaveProperty('emailVerified');
		expect(persistence).not.toHaveProperty('avatar_url');
		expect(persistence).not.toHaveProperty('name');
	});

	it('maps domain sort fields to persistence fields without changing search', () => {
		expect(
			UserMapper.toPersistenceQuery({
				search: { email: 'jane' },
				sort: { createdAt: -1, emailVerified: 1 },
			}),
		).toEqual({
			search: { email: 'jane' },
			sort: { created_at: -1, email_verified: 1 },
		});
	});
});
