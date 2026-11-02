import { describe, expect, it } from 'vitest';
import { nonOwnerRoleSchema, Roles, roleSchema } from './roles';

const INVALID_ROLE = 'apiResponses.users.invalidRoleFormat';

describe('role schemas', () => {
	it.each(Object.values(Roles))('accepts the "%s" role', (role) => {
		expect(roleSchema.safeParse(role).success).toBe(true);
	});

	it('rejects the owner role where only non-owner roles are allowed', () => {
		expect(nonOwnerRoleSchema.safeParse(Roles.owner).success).toBe(false);
	});

	it.each([
		['an unknown role', 'superuser'],
		['a missing role', undefined],
		['a non-string role', 1],
	])('reports the role locale key for %s', (_name, value) => {
		const result = roleSchema.safeParse(value);
		const nonOwnerResult = nonOwnerRoleSchema.safeParse(value);

		expect(result.error?.issues[0].message).toBe(INVALID_ROLE);
		expect(nonOwnerResult.error?.issues[0].message).toBe(INVALID_ROLE);
	});
});
