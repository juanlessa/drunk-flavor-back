import { describe, expect, it } from 'vitest';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { ForbiddenError } from '@/shared/error/error.lib';
import {
	CatalogChange,
	assertCanChangeCategory,
	assertCanChangeDrink,
	assertCanChangeIngredient,
	assertCanChangeUnit,
} from './catalogAuthorization.helpers';

const creatorId = '66b0000000000000000000a1';
const otherId = '66b0000000000000000000b2';

const actorOf = (role: Actor['role'], id = otherId): Actor => ({ id, role });
const record = (createdBy?: string) => ({ id: '66b0000000000000000000c3', ...(createdBy ? { createdBy } : {}) });

const assertions = {
	Unit: assertCanChangeUnit,
	Category: assertCanChangeCategory,
	Ingredient: assertCanChangeIngredient,
	Drink: assertCanChangeDrink,
};

describe.each(Object.entries(assertions))('Changing a %s', (_subject, assertCanChange) => {
	describe.each<CatalogChange>(['update', 'delete'])('%s', (action) => {
		const run = (actor: Actor, createdBy?: string) => () =>
			assertCanChange(action, record(createdBy), actor, 'test');

		it.each([Roles.owner, Roles.admin])('lets the %s change a record created by anyone', (role) => {
			expect(run(actorOf(role), creatorId)).not.toThrow();
		});

		it.each([Roles.owner, Roles.admin])('lets the %s change a record whose creator closed the account', (role) => {
			expect(run(actorOf(role))).not.toThrow();
		});

		it('lets a partner change a record they created', () => {
			expect(run(actorOf(Roles.partner, creatorId), creatorId)).not.toThrow();
		});

		it('does not let a partner change a record created by someone else', () => {
			expect(run(actorOf(Roles.partner), creatorId)).toThrow(ForbiddenError);
		});

		it('does not let a partner change a record whose creator closed the account', () => {
			expect(run(actorOf(Roles.partner))).toThrow(ForbiddenError);
		});

		it('does not let a member change a record, not even one with their id as creator', () => {
			expect(run(actorOf(Roles.member, creatorId), creatorId)).toThrow(ForbiddenError);
		});
	});
});
