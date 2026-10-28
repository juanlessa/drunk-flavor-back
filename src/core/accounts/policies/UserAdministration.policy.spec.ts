import { describe, expect, it } from 'vitest';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import {
	AdminPeerManagementForbiddenError,
	OwnerManagementRequiresTransferError,
	UserAdministrationForbiddenError,
	UserSelfAdministrationForbiddenError,
	UserStatusTransitionInvalidError,
} from '@/core/accounts/errors/user.errors';
import { UserStatus } from '@/core/accounts/entities/user.entity';
import { Actor } from '@/shared/accessControl/actor.types';
import { Role, Roles } from '@/shared/accessControl/roles';
import {
	UserAdministrationPolicy,
	UserAdministrationTarget,
	UserRoleChangeOutcomes,
	UserStatusChangeOutcomes,
} from './UserAdministration.policy';

const owner: Actor = { id: 'owner', role: Roles.owner };
const admin: Actor = { id: 'admin', role: Roles.admin };
const partner: Actor = { id: 'partner', role: Roles.partner };
const member: Actor = { id: 'member', role: Roles.member };
const policy = new UserAdministrationPolicy();

const target = (
	id: string,
	role: Role = Roles.member,
	status: UserStatus = UserStatuses.active,
): UserAdministrationTarget & { status: UserStatus } => ({ id, role, status });

describe('UserAdministrationPolicy', () => {
	it('allows only owner and admin to list and get users', () => {
		for (const actor of [owner, admin]) {
			expect(() => policy.assertCanListUsers(actor)).not.toThrow();
			expect(() => policy.assertCanGetUser(actor, target('target'))).not.toThrow();
		}
		for (const actor of [partner, member]) {
			expect(() => policy.assertCanListUsers(actor)).toThrow(UserAdministrationForbiddenError);
			expect(() => policy.assertCanGetUser(actor, target('target'))).toThrow(UserAdministrationForbiddenError);
		}
	});

	it('allows owner to create non-owner roles and limits admin to partner and member', () => {
		for (const role of [Roles.admin, Roles.partner, Roles.member]) {
			expect(() => policy.assertCanCreateUser(owner, role)).not.toThrow();
		}
		for (const role of [Roles.partner, Roles.member]) {
			expect(() => policy.assertCanCreateUser(admin, role)).not.toThrow();
		}
		expect(() => policy.assertCanCreateUser(admin, Roles.admin)).toThrow(UserAdministrationForbiddenError);
		expect(() => policy.assertCanCreateUser(owner, Roles.owner)).toThrow(OwnerManagementRequiresTransferError);
	});

	it('returns apply and noop only for authorized role transitions', () => {
		expect(policy.assertCanChangeRole(owner, target('target', Roles.member), Roles.admin)).toBe(
			UserRoleChangeOutcomes.apply,
		);
		expect(policy.assertCanChangeRole(admin, target('target', Roles.member), Roles.partner)).toBe(
			UserRoleChangeOutcomes.apply,
		);
		expect(policy.assertCanChangeRole(admin, target('target', Roles.member), Roles.member)).toBe(
			UserRoleChangeOutcomes.noop,
		);
	});

	it('rejects owner assignment, owner targets, self-management, and admin peer-management', () => {
		expect(() => policy.assertCanChangeRole(owner, target('target'), Roles.owner)).toThrow(
			OwnerManagementRequiresTransferError,
		);
		expect(() => policy.assertCanChangeRole(admin, target('owner', Roles.owner), Roles.member)).toThrow(
			OwnerManagementRequiresTransferError,
		);
		expect(() => policy.assertCanChangeRole(admin, target(admin.id, Roles.admin), Roles.member)).toThrow(
			UserSelfAdministrationForbiddenError,
		);
		expect(() => policy.assertCanChangeRole(admin, target('peer', Roles.admin), Roles.member)).toThrow(
			AdminPeerManagementForbiddenError,
		);
	});

	it('rejects role changes for statuses outside active and suspended', () => {
		expect(() =>
			policy.assertCanChangeRole(
				owner,
				target('target', Roles.member, UserStatuses.incomplete_profile),
				Roles.partner,
			),
		).toThrow(UserStatusTransitionInvalidError);
	});

	it('enforces apply, noop, and invalid status transitions', () => {
		expect(policy.assertCanSuspendUser(admin, target('target'))).toBe(UserStatusChangeOutcomes.apply);
		expect(policy.assertCanSuspendUser(admin, target('target', Roles.member, UserStatuses.suspended))).toBe(
			UserStatusChangeOutcomes.noop,
		);
		expect(policy.assertCanReactivateUser(admin, target('target', Roles.member, UserStatuses.suspended))).toBe(
			UserStatusChangeOutcomes.apply,
		);
		expect(policy.assertCanReactivateUser(admin, target('target'))).toBe(UserStatusChangeOutcomes.noop);
		expect(() =>
			policy.assertCanSuspendUser(admin, target('target', Roles.member, UserStatuses.incomplete_profile)),
		).toThrow(UserStatusTransitionInvalidError);
		expect(() =>
			policy.assertCanReactivateUser(admin, target('target', Roles.member, UserStatuses.incomplete_profile)),
		).toThrow(UserStatusTransitionInvalidError);
	});

	it('allows closure only for an authorized suspended target', () => {
		expect(() =>
			policy.assertCanCloseUser(admin, target('target', Roles.member, UserStatuses.suspended)),
		).not.toThrow();
		expect(() => policy.assertCanCloseUser(admin, target('target'))).toThrow(UserStatusTransitionInvalidError);
	});

	it('protects mutations against self, owner targets, admin peers, and non-administrators', () => {
		expect(() => policy.assertCanDeleteUser(admin, target(admin.id, Roles.admin))).toThrow(
			UserSelfAdministrationForbiddenError,
		);
		expect(() => policy.assertCanSuspendUser(owner, target('owner-target', Roles.owner))).toThrow(
			OwnerManagementRequiresTransferError,
		);
		expect(() => policy.assertCanReactivateUser(admin, target('peer', Roles.admin))).toThrow(
			AdminPeerManagementForbiddenError,
		);
		expect(() => policy.assertCanDeleteUser(member, target('target'))).toThrow(UserAdministrationForbiddenError);
	});

	it('allows only the owner to transfer ownership to another non-owner user', () => {
		expect(() => policy.assertCanTransferOwnership(owner, target('admin-target', Roles.admin))).not.toThrow();
		expect(() => policy.assertCanTransferOwnership(admin, target('admin-target', Roles.admin))).toThrow(
			UserAdministrationForbiddenError,
		);
		expect(() => policy.assertCanTransferOwnership(owner, target(owner.id, Roles.owner))).toThrow(
			UserSelfAdministrationForbiddenError,
		);
		expect(() => policy.assertCanTransferOwnership(owner, target('other-owner', Roles.owner))).toThrow(
			OwnerManagementRequiresTransferError,
		);
	});
});
