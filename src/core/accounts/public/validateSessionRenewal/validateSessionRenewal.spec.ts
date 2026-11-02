import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ValidateSessionRenewalService } from './ValidateSessionRenewal.service';

let usersRepository: UsersRepositoryInMemory;
let service: ValidateSessionRenewalService;

const createSessionUser = async () => {
	const user = await usersRepository.create(createUserFactory({ role: Roles.member, sessionVersion: 3 }));
	const session: AuthenticatedSession = {
		id: user.id,
		role: user.role,
		status: user.status,
		sessionVersion: user.sessionVersion,
	};
	return { user, session };
};

describe('Validate Session Renewal', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		service = new ValidateSessionRenewalService(usersRepository);
	});

	it('always loads the user and returns the persisted session', async () => {
		const { user, session } = await createSessionUser();
		await usersRepository.update({ id: user.id, role: Roles.partner });
		const findById = vi.spyOn(usersRepository, 'findById');

		await expect(service.execute({ session })).resolves.toEqual({ ...session, role: Roles.partner });
		expect(findById).toHaveBeenCalledWith(session.id);
	});

	it('rejects a session whose persisted version changed', async () => {
		const { user, session } = await createSessionUser();
		await usersRepository.incrementSessionVersion(user.id);

		await expect(service.execute({ session })).rejects.toBeInstanceOf(SessionRevokedError);
	});
});
