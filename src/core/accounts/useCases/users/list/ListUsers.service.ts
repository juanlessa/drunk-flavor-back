import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { ListUsers } from './listUsers.dtos';
import { findRequiredAdministrationUser, toAdministrationActor } from '../userAdministration.helpers';

export class ListUsersService {
	constructor(
		private usersRepository: IUsersRepository,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ query = {}, actor }: ListUsers) {
		const persistedActor = await findRequiredAdministrationUser(
			this.usersRepository,
			actor.id,
			'ListUsers.service.actor',
		);
		this.userAdministrationPolicy.assertCanListUsers(toAdministrationActor(persistedActor));

		return this.usersRepository.findAll(query);
	}
}
