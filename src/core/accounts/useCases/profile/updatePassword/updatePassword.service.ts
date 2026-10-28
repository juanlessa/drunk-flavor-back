import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { BadRequestError, UnauthorizedError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { UpdatePassword, UpdatePasswordResult } from './updatePassword.dtos';

export class UpdatePasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private hashProvider: IHashProvider,
		private transactionManager: ITransactionManager,
	) {}

	async execute({ id, currentPassword, newPassword }: UpdatePassword): Promise<UpdatePasswordResult> {
		return this.transactionManager.withTransaction(async () => {
			const user = await this.usersRepository.findById(id);
			const credential = user ? await this.credentialsRepository.findByUserId(user.id) : null;
			const passwordHash = credential?.passwordHash ?? (await this.hashProvider.getDummyHash());
			const currentPasswordMatch = await this.hashProvider.compare(currentPassword, passwordHash);

			if (!user || !credential || !currentPasswordMatch) {
				throw new UnauthorizedError('apiResponses.profile.invalidReauthentication', {
					path: 'UpdatePassword.service.authentication',
					cause: !user ? 'User does not exist' : 'Password credential is missing or invalid',
				});
			}

			const isNewPasswordSameAsCurrent = await this.hashProvider.compare(newPassword, credential.passwordHash);
			if (isNewPasswordSameAsCurrent) {
				throw new BadRequestError('apiResponses.users.newPasswordCannotMatchCurrent', {
					path: 'UpdatePassword.service.passwordReuse',
				});
			}

			const hashedPassword = await this.hashProvider.hash(newPassword);
			await this.credentialsRepository.update({ userId: user.id, passwordHash: hashedPassword });
			const updatedUser = await this.usersRepository.update({
				id: user.id,
				sessionVersion: user.sessionVersion + 1,
			});
			return { user: updatedUser };
		});
	}
}
