import { AppError } from '@/shared/error/error.lib';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { OwnershipTransferTargetIneligibleError } from '@/core/accounts/errors/ownershipTransfer.errors';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IOwnershipTransferInvitationsRepository } from '@/core/accounts/repositories/IOwnershipTransferInvitations.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { NonOwnerRole, Roles } from '@/shared/accessControl/roles';
import { assertEligibleOwnershipTarget } from '@/core/accounts/useCases/ownershipTransfer/ownershipTransfer.helpers';
import { findRequiredAdministrationUser, toAdministrationActor } from '../userAdministration.helpers';
import {
	GetUserAdministrativeCapabilities,
	UserAdministrativeCapabilities,
	UserAdministrativeCapabilityActions,
} from './getUserAdministrativeCapabilities.dtos';

const roleTransitionCandidates: readonly NonOwnerRole[] = [Roles.admin, Roles.partner, Roles.member];

const policyAllows = (check: () => unknown): boolean => {
	try {
		check();
		return true;
	} catch (error) {
		if (error instanceof AppError) {
			return false;
		}
		throw error;
	}
};

export class GetUserAdministrativeCapabilitiesService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private invitationsRepository: IOwnershipTransferInvitationsRepository,
		private dateProvider: IDateProvider,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ id, actor }: GetUserAdministrativeCapabilities): Promise<UserAdministrativeCapabilities> {
		const [persistedActor, target] = await Promise.all([
			findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'GetUserAdministrativeCapabilities.service.actor',
			),
			findRequiredAdministrationUser(
				this.usersRepository,
				id,
				'GetUserAdministrativeCapabilities.service.target',
			),
		]);
		const currentActor = toAdministrationActor(persistedActor);
		this.userAdministrationPolicy.assertCanGetUser(currentActor, target);

		if (currentActor.id === target.id) {
			return { actions: [], roleTransitions: [] };
		}

		const roleTransitions = roleTransitionCandidates.filter(
			(role) =>
				role !== target.role &&
				policyAllows(() => this.userAdministrationPolicy.assertCanChangeRole(currentActor, target, role)),
		);
		const actions: UserAdministrativeCapabilities['actions'] = [];
		if (roleTransitions.length > 0) {
			actions.push(UserAdministrativeCapabilityActions.changeRole);
		}
		if (
			target.status === UserStatuses.active &&
			policyAllows(() => this.userAdministrationPolicy.assertCanSuspendUser(currentActor, target))
		) {
			actions.push(UserAdministrativeCapabilityActions.suspend);
		}
		if (
			target.status === UserStatuses.suspended &&
			policyAllows(() => this.userAdministrationPolicy.assertCanReactivateUser(currentActor, target))
		) {
			actions.push(UserAdministrativeCapabilityActions.reactivate);
		}
		if (policyAllows(() => this.userAdministrationPolicy.assertCanCloseUser(currentActor, target))) {
			actions.push(UserAdministrativeCapabilityActions.close);
		}
		if (await this.canRequestOwnershipTransfer(currentActor, target)) {
			actions.push(UserAdministrativeCapabilityActions.requestOwnershipTransfer);
		}

		return { actions, roleTransitions };
	}

	private async canRequestOwnershipTransfer(
		actor: ReturnType<typeof toAdministrationActor>,
		target: Awaited<ReturnType<typeof findRequiredAdministrationUser>>,
	): Promise<boolean> {
		if (!policyAllows(() => this.userAdministrationPolicy.assertCanTransferOwnership(actor, target))) {
			return false;
		}

		const invitation = await this.invitationsRepository.findSingleton();
		if (invitation && !this.dateProvider.isExpiredDate(invitation.expiresAt)) {
			return false;
		}

		try {
			await assertEligibleOwnershipTarget(
				target,
				this.credentialsRepository,
				this.identitiesRepository,
				'GetUserAdministrativeCapabilities.service.ownershipTarget',
			);
			return true;
		} catch (error) {
			if (error instanceof OwnershipTransferTargetIneligibleError) {
				return false;
			}
			throw error;
		}
	}
}
