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
});
