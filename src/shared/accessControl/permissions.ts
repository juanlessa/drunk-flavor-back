import { AbilityBuilder } from '@casl/ability';
import { AppAbility } from './types';
import { Role } from './roles';
import { UserPermissionModel } from './entities/user';

type PermissionsByRole = (user: UserPermissionModel, builder: AbilityBuilder<AppAbility>) => void;

export const permissions: Record<Role, PermissionsByRole> = {
	admin(user, { can, cannot }) {
		can('manage', 'all');
		// User management is admin-only. `manage all` already covers it, but this explicit
		// grant documents the intent and keeps `User` admin-only if `manage all` is ever narrowed.
		can('manage', 'User');
		// Ordinary updates of engagement resources are owner-only, even for Admin. Delete and
		// moderate remain unrestricted for Admin through `manage all`.
		cannot('update', ['Comment', 'Rating'], { user_id: { $ne: user.id } });
	},
	partner(user, { can }) {
		can('manage', 'Category');
		can('manage', 'Unit');
		can('manage', 'Ingredient');
		can('manage', 'Drink');
		can(['create', 'list', 'get'], 'Comment');
		can(['create', 'list', 'get'], 'Rating');
		can(['update', 'delete'], 'Comment', { user_id: { $eq: user.id } });
		can(['update', 'delete'], 'Rating', { user_id: { $eq: user.id } });
	},
	member(user, { can }) {
		can(['list', 'get'], 'Category');
		can(['list', 'get'], 'Unit');
		can(['list', 'get'], 'Ingredient');
		can(['list', 'get'], 'Drink');
		can(['create', 'list', 'get'], 'Comment');
		can(['create', 'list', 'get'], 'Rating');
		can(['update', 'delete'], 'Comment', { user_id: { $eq: user.id } });
		can(['update', 'delete'], 'Rating', { user_id: { $eq: user.id } });
	},
};
