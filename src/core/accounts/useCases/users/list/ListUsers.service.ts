import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { toUserView } from '@/core/accounts/mappers/user.mappers';
import { ListUsersCommand } from './listUsers.dtos';
import { authorizeUserAdministration } from '@/core/accounts/helpers/userAdministrationAudit.helpers';
import {
	findRequiredAdministrationUser,
	toAdministrationActor,
} from '@/core/accounts/helpers/userAdministration.helpers';

export class ListUsersService {
	constructor(
		private usersRepository: IUsersRepository,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ query = {}, actor, administrativeContext }: ListUsersCommand) {
		const persistedActor = await findRequiredAdministrationUser(
			this.usersRepository,
			actor.id,
			'ListUsers.service.actor',
		);
		const currentActor = toAdministrationActor(persistedActor);
		authorizeUserAdministration(
			{
				action: 'user.list',
				actorId: currentActor.id,
				context: administrativeContext,
			},
			() => this.userAdministrationPolicy.assertCanListUsers(currentActor),
		);

		const users = await this.usersRepository.findAll(query);
		return users.map(toUserView);
	}
}
