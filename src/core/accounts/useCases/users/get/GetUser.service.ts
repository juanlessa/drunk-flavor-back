import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { toUserView } from '@/core/accounts/mappers/user.mappers';
import { GetUser } from './getUser.dtos';
import { authorizeUserAdministration } from '../userAdministrationAudit.helpers';
import { findRequiredAdministrationUser, toAdministrationActor } from '../userAdministration.helpers';

export class GetUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ id, actor, administrativeContext }: GetUser) {
		const [persistedActor, target] = await Promise.all([
			findRequiredAdministrationUser(this.usersRepository, actor.id, 'GetUser.service.actor'),
			findRequiredAdministrationUser(this.usersRepository, id, 'GetUser.service.target'),
		]);
		const currentActor = toAdministrationActor(persistedActor);
		authorizeUserAdministration(
			{
				action: 'user.get',
				actorId: currentActor.id,
				targetUserId: target.id,
				context: administrativeContext,
			},
			() => this.userAdministrationPolicy.assertCanGetUser(currentActor, target),
		);

		return toUserView(target);
	}
}
