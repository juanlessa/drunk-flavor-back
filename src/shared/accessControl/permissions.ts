import { AbilityBuilder } from '@casl/ability';
import { AppAbility } from './types';
import { Role, Roles } from './roles';
import { UserPermissionModel } from './entities/user';

const ADMIN_MANAGED_ROLES = [Roles.partner, Roles.member];

type PermissionsByRole = (user: UserPermissionModel, builder: AbilityBuilder<AppAbility>) => void;

export const permissions: Record<Role, PermissionsByRole> = {
	owner(user, { can, cannot }) {
		can('manage', 'all');
		cannot('update', ['Comment', 'Rating'], { user_id: { $ne: user.id } });
	},
	admin(user, { can }) {
		can('manage', ['Category', 'Unit', 'Ingredient', 'Drink']);
		can(['create', 'list', 'get', 'delete'], ['Comment', 'Rating']);
		can('moderate', 'Comment');
		can('update', ['Comment', 'Rating'], { user_id: { $eq: user.id } });

		can(['list', 'get'], 'User');
		can('create', 'User', { role: { $in: ADMIN_MANAGED_ROLES } });
		can(['delete', 'suspend', 'reactivate'], 'User', {
			id: { $ne: user.id },
			role: { $in: ADMIN_MANAGED_ROLES },
		});
		can('changeRole', 'User', {
			id: { $ne: user.id },
			role: { $in: ADMIN_MANAGED_ROLES },
			requestedRole: { $in: ADMIN_MANAGED_ROLES },
		});

		// Compatibility grant for use cases that still check the legacy `update`
		// action by subject type. Remove it when every role change uses `changeRole`
		// with a concrete User subject.
		can('update', 'User', {
			id: { $ne: user.id },
			role: { $in: ADMIN_MANAGED_ROLES },
		});
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
