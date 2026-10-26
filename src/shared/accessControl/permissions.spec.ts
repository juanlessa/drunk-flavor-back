import { defineAbilityFor } from '@/shared/accessControl';
import { CommentPermissionModel } from '@/shared/accessControl/entities/comment';
import { RatingPermissionModel } from '@/shared/accessControl/entities/rating';
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
	user_id: ownerId,
	drink_id: new ObjectId().toString(),
};
const foreignRating: RatingPermissionModel = { ...ownRating, user_id: foreignId };

const ownComment: CommentPermissionModel = {
	__typename: 'Comment',
	id: new ObjectId().toString(),
	user_id: ownerId,
	drink_id: new ObjectId().toString(),
};
const foreignComment: CommentPermissionModel = { ...ownComment, user_id: foreignId };

describe('Engagement permissions', () => {
	describe.each([Roles.admin, Roles.partner, Roles.member])('%s role', (role) => {
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

	it('allows Admin to delete any rating or comment', () => {
		const { can } = defineAbilityFor(makeUser(Roles.admin));
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

	it('allows only Admin to moderate comments', () => {
		expect(defineAbilityFor(makeUser(Roles.admin)).can('moderate', ownComment)).toBe(true);
		expect(defineAbilityFor(makeUser(Roles.partner)).can('moderate', ownComment)).toBe(false);
		expect(defineAbilityFor(makeUser(Roles.member)).can('moderate', ownComment)).toBe(false);
	});
});
