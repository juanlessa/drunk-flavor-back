import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { UpdateProfile } from './updateProfile.dtos';

export class UpdateProfileService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ id, name, surname }: UpdateProfile) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'UpdateProfile.service' });
		}

		await this.usersRepository.update({ id, name, surname });
	}
}
