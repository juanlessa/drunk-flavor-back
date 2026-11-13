import { AbilityBuilder } from '@casl/ability';
import { AppAbility } from './types';
import { Role, Roles } from './roles';
import { UserPermissionModel } from './entities/user';

const ADMIN_MANAGED_ROLES = [Roles.partner, Roles.member];

/**
 * The catalog subjects a partner contributes to; a partner changes only the records they created. `listWithAuthorship` and
 * `getWithAuthorship` are the reads for the people who contribute to the catalog, which also show who created each
 * record.
 */
const CATALOG_SUBJECTS = ['Category', 'Unit', 'Ingredient', 'Drink'] as const;

type PermissionsByRole = (user: UserPermissionModel, builder: AbilityBuilder<AppAbility>) => void;

export const permissions: Record<Role, PermissionsByRole> = {
	owner(user, { can, cannot }) {
		can('manage', 'all');
		cannot('update', ['Comment', 'Rating'], { userId: { $ne: user.id } });
	},
	admin(user, { can }) {
		can('manage', ['Category', 'Unit', 'Ingredient', 'Drink']);
		can(['create', 'list', 'get', 'delete'], ['Comment', 'Rating']);
		can(['create', 'list', 'delete'], 'Favorite');
		can('moderate', 'Comment');
		can('update', ['Comment', 'Rating'], { userId: { $eq: user.id } });

		can(['list', 'get'], 'User');
		can(['suspend', 'reactivate', 'close', 'revokeSessions'], 'User', {
			id: { $ne: user.id },
			role: { $in: ADMIN_MANAGED_ROLES },
		});
		can('changeRole', 'User', {
			id: { $ne: user.id },
			role: { $in: ADMIN_MANAGED_ROLES },
			requestedRole: { $in: ADMIN_MANAGED_ROLES },
		});
	},
	partner(user, { can }) {
		can(['create', 'list', 'listWithAuthorship', 'get', 'getWithAuthorship'], [...CATALOG_SUBJECTS]);
		can(['update', 'delete'], [...CATALOG_SUBJECTS], { createdBy: { $eq: user.id } });
		can(['create', 'list', 'get'], 'Comment');
		can(['create', 'list', 'get'], 'Rating');
		can(['create', 'list', 'delete'], 'Favorite');
		can(['update', 'delete'], 'Comment', { userId: { $eq: user.id } });
		can(['update', 'delete'], 'Rating', { userId: { $eq: user.id } });
	},
	member(user, { can }) {
		can(['list', 'get'], 'Category');
		can(['list', 'get'], 'Unit');
		can(['list', 'get'], 'Ingredient');
		can(['list', 'get'], 'Drink');
		can(['create', 'list', 'get'], 'Comment');
		can(['create', 'list', 'get'], 'Rating');
		can(['create', 'list', 'delete'], 'Favorite');
		can(['update', 'delete'], 'Comment', { userId: { $eq: user.id } });
		can(['update', 'delete'], 'Rating', { userId: { $eq: user.id } });
	},
};
