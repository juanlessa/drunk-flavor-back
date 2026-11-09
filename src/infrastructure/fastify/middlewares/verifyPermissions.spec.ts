import { describe, expect, it } from 'vitest';
import { ForbiddenError } from '@/shared/error/error.lib';
import { Roles } from '@/shared/accessControl/roles';
import { verifyPermissions } from './verifyPermissions';

const run = (role: string) =>
	verifyPermissions('create', 'Unit')({ user: { id: 'user-id', role } } as never, {} as never);

describe('verifyPermissions', () => {
	it('lets a role with the permission through', async () => {
		await expect(run(Roles.admin)).resolves.toBeUndefined();
	});

	it('rejects a role without the permission as insufficient permissions, not as bad credentials', async () => {
		const rejection = await run(Roles.member).catch((error: unknown) => error);

		expect(rejection).toBeInstanceOf(ForbiddenError);
		expect((rejection as ForbiddenError).message).toBe('apiResponses.auth.insufficientPermissions');
	});

	describe.each(['Category', 'Unit', 'Ingredient', 'Drink'] as const)(
		'the reads with authorship of %s',
		(subject) => {
			const read = (action: 'listWithAuthorship' | 'getWithAuthorship', role: string) =>
				verifyPermissions(action, subject)({ user: { id: 'user-id', role } } as never, {} as never);

			describe.each(['listWithAuthorship', 'getWithAuthorship'] as const)('%s', (action) => {
				it.each([Roles.partner, Roles.admin, Roles.owner])('lets the %s through', async (role) => {
					await expect(read(action, role)).resolves.toBeUndefined();
				});

				it('rejects a member as insufficient permissions', async () => {
					const rejection = await read(action, Roles.member).catch((error: unknown) => error);

					expect(rejection).toBeInstanceOf(ForbiddenError);
					expect((rejection as ForbiddenError).message).toBe('apiResponses.auth.insufficientPermissions');
				});
			});
		},
	);

	it('lets a partner through an update by type, leaving the check of the record to the service', async () => {
		await expect(
			verifyPermissions('update', 'Unit')({ user: { id: 'user-id', role: Roles.partner } } as never, {} as never),
		).resolves.toBeUndefined();
	});
});
