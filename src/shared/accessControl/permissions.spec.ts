import { defineAbilityFor } from '@/shared/accessControl';
import { CategoryPermissionModel } from '@/shared/accessControl/entities/category';
import { CommentPermissionModel } from '@/shared/accessControl/entities/comment';
import { DrinkPermissionModel } from '@/shared/accessControl/entities/drink';
import { IngredientPermissionModel } from '@/shared/accessControl/entities/ingredient';
import { RatingPermissionModel } from '@/shared/accessControl/entities/rating';
import { UnitPermissionModel } from '@/shared/accessControl/entities/unit';
import { UserPermissionModel } from '@/shared/accessControl/entities/user';
import { Roles } from '@/shared/accessControl/roles';
import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';

const ownerId = new ObjectId().toString();
const foreignId = new ObjectId().toString();

const makeUser = (role: UserPermissionModel['role'], id = ownerId): UserPermissionModel => ({
	__typename: 'User',
	id,
	role,
});

const ownRating: RatingPermissionModel = {
	__typename: 'Rating',
	id: new ObjectId().toString(),
	userId: ownerId,
	drinkId: new ObjectId().toString(),
};
const foreignRating: RatingPermissionModel = { ...ownRating, userId: foreignId };

const ownComment: CommentPermissionModel = {
	__typename: 'Comment',
	id: new ObjectId().toString(),
	userId: ownerId,
	drinkId: new ObjectId().toString(),
};
const foreignComment: CommentPermissionModel = { ...ownComment, userId: foreignId };

describe('Engagement permissions', () => {
	describe.each([Roles.owner, Roles.admin, Roles.partner, Roles.member])('%s role', (role) => {
		const ability = () => defineAbilityFor(makeUser(role));

		it('may update its own rating and comment', () => {
			const { can } = ability();
			expect(can('update', ownRating)).toBe(true);
			expect(can('update', ownComment)).toBe(true);
		});

		it('may not update a foreign rating or comment', () => {
			const { can } = ability();
			expect(can('update', foreignRating)).toBe(false);
			expect(can('update', foreignComment)).toBe(false);
		});

		it('may create, list and get both resources', () => {
			const { can } = ability();
			expect(can('create', 'Rating')).toBe(true);
			expect(can('list', 'Comment')).toBe(true);
			expect(can('get', 'Rating')).toBe(true);
		});
	});

	it.each([Roles.owner, Roles.admin])('allows %s to delete any rating or comment', (role) => {
		const { can } = defineAbilityFor(makeUser(role));
		expect(can('delete', foreignRating)).toBe(true);
		expect(can('delete', foreignComment)).toBe(true);
	});

	it.each([Roles.partner, Roles.member])('restricts %s delete to owned resources', (role) => {
		const { can } = defineAbilityFor(makeUser(role));
		expect(can('delete', ownRating)).toBe(true);
		expect(can('delete', foreignRating)).toBe(false);
		expect(can('delete', ownComment)).toBe(true);
		expect(can('delete', foreignComment)).toBe(false);
	});

	it.each([Roles.owner, Roles.admin])('allows %s to moderate comments', (role) => {
		expect(defineAbilityFor(makeUser(role)).can('moderate', ownComment)).toBe(true);
	});

	it.each([Roles.partner, Roles.member])('prevents %s from moderating comments', (role) => {
		expect(defineAbilityFor(makeUser(role)).can('moderate', ownComment)).toBe(false);
	});
});

describe('User administration permissions', () => {
	it.each([Roles.owner, Roles.admin])('allows %s to revoke managed user sessions', (role) => {
		const { can } = defineAbilityFor(makeUser(role));
		expect(can('revokeSessions', makeUser(Roles.member, foreignId))).toBe(true);
	});

	it('prevents an admin from revoking self, owner, or peer-admin sessions', () => {
		const { can } = defineAbilityFor(makeUser(Roles.admin));
		expect(can('revokeSessions', makeUser(Roles.admin, ownerId))).toBe(false);
		expect(can('revokeSessions', makeUser(Roles.owner, foreignId))).toBe(false);
		expect(can('revokeSessions', makeUser(Roles.admin, foreignId))).toBe(false);
	});

	it.each([Roles.partner, Roles.member])('prevents %s from revoking user sessions', (role) => {
		const { can } = defineAbilityFor(makeUser(role));
		expect(can('revokeSessions', makeUser(Roles.member, foreignId))).toBe(false);
	});
});

const catalogRecord = (typename: 'Category' | 'Unit' | 'Ingredient' | 'Drink', createdBy?: string) =>
	({
		__typename: typename,
		id: new ObjectId().toString(),
		...(createdBy ? { createdBy } : {}),
	}) as CategoryPermissionModel | UnitPermissionModel | IngredientPermissionModel | DrinkPermissionModel;

describe.each(['Category', 'Unit', 'Ingredient', 'Drink'] as const)('Catalog permissions over %s', (typename) => {
	const own = catalogRecord(typename, ownerId);
	const foreign = catalogRecord(typename, foreignId);
	const withoutCreator = catalogRecord(typename);

	it.each([Roles.owner, Roles.admin])('lets the %s do anything, whoever created the record', (role) => {
		const { can } = defineAbilityFor(makeUser(role));

		for (const record of [own, foreign, withoutCreator]) {
			expect(can('update', record)).toBe(true);
			expect(can('delete', record)).toBe(true);
		}
		expect(can('create', typename)).toBe(true);
		expect(can('listWithAuthorship', typename)).toBe(true);
		expect(can('getWithAuthorship', typename)).toBe(true);
	});

	describe('a partner', () => {
		const { can } = defineAbilityFor(makeUser(Roles.partner));

		it('may create, list and get', () => {
			expect(can('create', typename)).toBe(true);
			expect(can('list', typename)).toBe(true);
			expect(can('get', typename)).toBe(true);
		});

		it('may list and get with the authorship', () => {
			expect(can('listWithAuthorship', typename)).toBe(true);
			expect(can('getWithAuthorship', typename)).toBe(true);
		});

		it('may update and delete a record they created', () => {
			expect(can('update', own)).toBe(true);
			expect(can('delete', own)).toBe(true);
		});

		it('may not update or delete a record created by someone else', () => {
			expect(can('update', foreign)).toBe(false);
			expect(can('delete', foreign)).toBe(false);
		});

		it('may not update or delete a record whose creator closed the account', () => {
			expect(can('update', withoutCreator)).toBe(false);
			expect(can('delete', withoutCreator)).toBe(false);
		});

		it('passes the check by type alone, which is why the services check the record', () => {
			expect(can('update', typename)).toBe(true);
			expect(can('delete', typename)).toBe(true);
		});
	});

	describe('a member', () => {
		const { can } = defineAbilityFor(makeUser(Roles.member));

		it('may only list and get', () => {
			expect(can('list', typename)).toBe(true);
			expect(can('get', typename)).toBe(true);
			expect(can('create', typename)).toBe(false);
		});

		it('may not list or get with the authorship', () => {
			expect(can('listWithAuthorship', typename)).toBe(false);
			expect(can('getWithAuthorship', typename)).toBe(false);
		});

		it('may not update or delete, not even a record that has their id as creator', () => {
			expect(can('update', own)).toBe(false);
			expect(can('delete', own)).toBe(false);
		});
	});
});
