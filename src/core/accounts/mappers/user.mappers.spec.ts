import { describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { omitUserPassword } from './user.mappers';
import { User } from '@/core/accounts/entities/user.entity';
import { createUserFactory } from '@/core/accounts/factories/user.factories';

const buildUser = (): User => ({
	_id: new ObjectId(),
	created_at: new Date(),
	updated_at: new Date(),
	...createUserFactory({ email: 'jane@example.com' }),
});

describe('omitUserPassword', () => {
	it('Should remove the password field from the user', () => {
		const user = buildUser();

		const result = omitUserPassword(user);

		expect(result).not.toHaveProperty('password');
	});

	it('Should preserve every non-password field', () => {
		const user = buildUser();

		const result = omitUserPassword(user);

		expect(result).toMatchObject({
			_id: user._id,
			name: user.name,
			surname: user.surname,
			email: user.email,
			role: user.role,
			status: user.status,
			created_at: user.created_at,
			updated_at: user.updated_at,
		});
	});
});
