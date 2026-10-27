import { User } from '@/core/accounts/entities/user.entity';
import {
	AdminPeerManagementForbiddenError,
	OwnerManagementRequiresTransferError,
	UserAdministrationForbiddenError,
	UserRoleTransitionInvalidError,
	UserSelfAdministrationForbiddenError,
} from '@/core/accounts/errors/user.errors';
import { defineAbilityFor } from '@/shared/accessControl';
import { Actor } from '@/shared/accessControl/actor.types';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';
import { NonOwnerRole, Role, Roles } from '@/shared/accessControl/roles';

const PROSPECTIVE_USER_ID = 'prospective-user';

const validRoleTransitions: Record<NonOwnerRole, readonly NonOwnerRole[]> = {
	admin: [Roles.partner, Roles.member],
	partner: [Roles.admin, Roles.member],
	member: [Roles.admin, Roles.partner],
};

export const UserRoleChangeOutcomes = {
	apply: 'apply',
	noop: 'noop',
} as const;

export type UserRoleChangeOutcome = (typeof UserRoleChangeOutcomes)[keyof typeof UserRoleChangeOutcomes];
export type UserAdministrationTarget = Pick<User, 'id' | 'role'>;

export class UserAdministrationPolicy {
	assertCanListUsers(actor: Actor): void {
		const ability = this.defineAbility(actor);
		if (ability.cannot('list', 'User')) {
			throw new UserAdministrationForbiddenError({ path: 'UserAdministrationPolicy.list' });
		}
	}

	assertCanGetUser(actor: Actor, target: UserAdministrationTarget): void {
		const ability = this.defineAbility(actor);
		if (ability.cannot('get', this.toSubject(target))) {
			throw new UserAdministrationForbiddenError({ path: 'UserAdministrationPolicy.get' });
		}
	}

	assertCanCreateUser(actor: Actor, requestedRole: Role): void {
		this.assertNonOwnerRole(requestedRole, 'UserAdministrationPolicy.create');

		const ability = this.defineAbility(actor);
		const prospectiveUser = this.toSubject({ id: PROSPECTIVE_USER_ID, role: requestedRole });
		if (ability.cannot('create', prospectiveUser)) {
			throw new UserAdministrationForbiddenError({ path: 'UserAdministrationPolicy.create' });
		}
	}

	assertCanChangeRole(actor: Actor, target: UserAdministrationTarget, requestedRole: Role): UserRoleChangeOutcome {
		this.assertNotSelf(actor, target, 'UserAdministrationPolicy.changeRole');
		this.assertNonOwnerTarget(target, 'UserAdministrationPolicy.changeRole');
		this.assertNonOwnerRole(requestedRole, 'UserAdministrationPolicy.changeRole');

		const ability = this.defineAbility(actor);
		const subject = this.toSubject({ ...target, requestedRole });
		if (ability.cannot('changeRole', subject)) {
			this.throwTargetAwareForbidden(actor, target, 'UserAdministrationPolicy.changeRole');
		}

		if (target.role === requestedRole) {
			return UserRoleChangeOutcomes.noop;
		}

		if (!this.isValidRoleTransition(target.role, requestedRole)) {
			throw new UserRoleTransitionInvalidError({ path: 'UserAdministrationPolicy.changeRole' });
		}

		return UserRoleChangeOutcomes.apply;
	}

	assertCanDeleteUser(actor: Actor, target: UserAdministrationTarget): void {
		this.assertCanMutateTarget('delete', actor, target);
	}

	assertCanSuspendUser(actor: Actor, target: UserAdministrationTarget): void {
		this.assertCanMutateTarget('suspend', actor, target);
	}

	assertCanReactivateUser(actor: Actor, target: UserAdministrationTarget): void {
		this.assertCanMutateTarget('reactivate', actor, target);
	}

	assertCanTransferOwnership(actor: Actor, target: UserAdministrationTarget): void {
		this.assertNotSelf(actor, target, 'UserAdministrationPolicy.transferOwnership');
		this.assertNonOwnerTarget(target, 'UserAdministrationPolicy.transferOwnership');

		const ability = this.defineAbility(actor);
		if (ability.cannot('transferOwnership', this.toSubject(target))) {
			throw new UserAdministrationForbiddenError({ path: 'UserAdministrationPolicy.transferOwnership' });
		}
	}

	private assertCanMutateTarget(
		action: 'delete' | 'suspend' | 'reactivate',
		actor: Actor,
		target: UserAdministrationTarget,
	): void {
		const path = `UserAdministrationPolicy.${action}`;
		this.assertNotSelf(actor, target, path);
		this.assertNonOwnerTarget(target, path);

		const ability = this.defineAbility(actor);
		if (ability.cannot(action, this.toSubject(target))) {
			this.throwTargetAwareForbidden(actor, target, path);
		}
	}

	private defineAbility(actor: Actor) {
		return defineAbilityFor(userPermissionSchema.parse({ id: actor.id, role: actor.role }));
	}

	private toSubject(target: UserAdministrationTarget & { requestedRole?: Role }) {
		return userPermissionSchema.parse(target);
	}

	private assertNotSelf(actor: Actor, target: UserAdministrationTarget, path: string): void {
		if (actor.id === target.id) {
			throw new UserSelfAdministrationForbiddenError({ path });
		}
	}

	private assertNonOwnerTarget(target: UserAdministrationTarget, path: string): void {
		if (target.role === Roles.owner) {
			throw new OwnerManagementRequiresTransferError({ path });
		}
	}

	private assertNonOwnerRole(role: Role, path: string): asserts role is NonOwnerRole {
		if (role === Roles.owner) {
			throw new OwnerManagementRequiresTransferError({ path });
		}
	}

	private isValidRoleTransition(currentRole: Role, requestedRole: Role): boolean {
		if (currentRole === Roles.owner || requestedRole === Roles.owner) {
			return false;
		}
		return validRoleTransitions[currentRole].includes(requestedRole);
	}

	private throwTargetAwareForbidden(actor: Actor, target: UserAdministrationTarget, path: string): never {
		if (actor.role === Roles.admin && target.role === Roles.admin) {
			throw new AdminPeerManagementForbiddenError({ path });
		}
		throw new UserAdministrationForbiddenError({ path });
	}
}
