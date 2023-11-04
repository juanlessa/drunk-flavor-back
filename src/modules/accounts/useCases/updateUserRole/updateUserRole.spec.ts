import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/Users.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/Bcrypt.provider';
import { ObjectId } from 'bson';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserRoleService } from '@modules/accounts/useCases/updateUserRole/UpdateUserRole.service';
import { BadRequestError } from '@shared/errors/error.lib';

let usersRepositoryInMemory: UsersRepositoryInMemory;
let updateUserRoleService: UpdateUserRoleService;
let encryptionProvider: BcryptProvider;

// test constants
const partnerName = 'partner';
const partnerSurname = 'Test';
const partnerEmail = 'partner.user@test.com';
const partnerPlanPassword = '987654321';

describe('Update User Role', () => {
	beforeEach(async () => {
		encryptionProvider = new BcryptProvider();
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		updateUserRoleService = new UpdateUserRoleService(usersRepositoryInMemory);
	});

	it('Should be able to update the role of an user', async () => {
		const createdPartnerUser = await usersRepositoryInMemory.create({
			name: partnerName,
			surname: partnerSurname,
			email: partnerEmail,
			role: ROLES.partner,
			password: await encryptionProvider.hash(partnerPlanPassword)
		});

		await updateUserRoleService.execute({ user_id: createdPartnerUser._id, role: ROLES.admin });

		const verifyUser = await usersRepositoryInMemory.findById(createdPartnerUser._id);

		expect(verifyUser.role).toEqual(ROLES.admin);
	});

	it('Should not be able to update the role of a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(
			updateUserRoleService.execute({
				user_id: nonexistentId,
				role: ROLES.admin
			})
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
