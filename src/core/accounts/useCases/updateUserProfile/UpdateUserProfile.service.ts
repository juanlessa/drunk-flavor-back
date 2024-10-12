import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { UpdateUserProfile } from './updateUserProfile.dtos';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';

export class UpdateUserProfileService {
	constructor(
		private usersRepository: IUsersRepository,
		private hashProvider: IHashProvider,
	) {}

	async execute({ id, name, surname, password, email }: UpdateUserProfile) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'UpdateUser.service' });
		}

		const userEmailALreadyInUse = await this.usersRepository.findByEmail(email);
		if (userEmailALreadyInUse && userEmailALreadyInUse._id.toString() !== user._id.toString()) {
			throw new BadRequestError('apiResponses.users.alreadyExist', { path: 'UpdateUser.service' });
		}

		const passwordHash = await this.hashProvider.hash(password);

		await this.usersRepository.update({ id, name, surname, password: passwordHash, email });
	}
}
