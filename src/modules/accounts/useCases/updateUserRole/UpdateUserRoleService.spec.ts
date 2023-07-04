import { USER_ERRORS } from '@modules/accounts/errors/userErrors';
import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/UsersRepository';
import { ROLES } from '@modules/accounts/types/roles';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/BcryptProvider';
import AppError from '@shared/errors/AppError';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserRoleService } from './UpdateUserRoleService';

let usersRepositoryInMemory: UsersRepositoryInMemory;
let updateUserRoleService: UpdateUserRoleService;
let bcryptProvider: BcryptProvider;

// test constants
const partnerName = 'partner';
const partnerSurname = 'Test';
const partnerEmail = 'partner.user@test.com';
const partnerPlanPassword = '987654321';

describe('Update User Role', () => {
	beforeEach(async () => {
		bcryptProvider = new BcryptProvider();
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		updateUserRoleService = new UpdateUserRoleService(usersRepositoryInMemory);
	});

	it('Should be able to update the role of an user', async () => {
		const createdPartnerUser = await usersRepositoryInMemory.create({
			name: partnerName,
			surname: partnerSurname,
			email: partnerEmail,
			role: ROLES.partner,
			password: await bcryptProvider.hash(partnerPlanPassword)
		});

		await updateUserRoleService.execute({ userId: createdPartnerUser.id, role: ROLES.admin });

		const verifyUser = await usersRepositoryInMemory.findById(createdPartnerUser.id);

		expect(verifyUser.role).toEqual(ROLES.admin);
	});

	it('Should not be able to update the role of a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(
			updateUserRoleService.execute({
				userId: nonexistentId,
				role: ROLES.admin
			})
		).rejects.toEqual(new AppError(USER_ERRORS.not_exist));
	});
});
