import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { toUserView } from '@/core/accounts/mappers/user.mappers';
import { GetUser } from './getUser.dtos';
import { findRequiredAdministrationUser, toAdministrationActor } from '../userAdministration.helpers';

export class GetUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ id, actor }: GetUser) {
		const [persistedActor, target] = await Promise.all([
			findRequiredAdministrationUser(this.usersRepository, actor.id, 'GetUser.service.actor'),
			findRequiredAdministrationUser(this.usersRepository, id, 'GetUser.service.target'),
		]);

		this.userAdministrationPolicy.assertCanGetUser(toAdministrationActor(persistedActor), target);
		return toUserView(target);
	}
}
