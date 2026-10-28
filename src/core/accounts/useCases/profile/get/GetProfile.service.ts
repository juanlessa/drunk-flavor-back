import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { GetProfile, ProfileView } from './getProfile.dtos';
import { toUserView } from '@/core/accounts/mappers/user.mappers';

export class GetProfileService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
	) {}

	async execute({ id }: GetProfile): Promise<ProfileView> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundError('apiResponses.users.notExist', { path: 'GetProfile.service' });
		}

		const [passwordEnabled, providers] = await Promise.all([
			this.credentialsRepository.existsByUserId(id),
			this.identitiesRepository.listProvidersByUserId(id),
		]);

		return {
			...toUserView(user),
			authentication_methods: {
				password: { enabled: passwordEnabled },
				providers,
			},
		};
	}
}
