import { AbilityBuilder } from '@casl/ability';
import { AppAbility } from './types';
import { Role } from './roles';
import { UserPermissionModel } from './entities/user';

type PermissionsByRole = (user: UserPermissionModel, builder: AbilityBuilder<AppAbility>) => void;

export const permissions: Record<Role, PermissionsByRole> = {
	admin(_, { can }) {
		can('manage', 'all');
	},
	partner(_, { can }) {
		can('manage', 'Category');
		can('manage', 'Ingredient');
		can('manage', 'Drink');
	},
	member(user, { can }) {
		can(['list', 'get'], 'Category');
		can(['list', 'get'], 'Ingredient');
		can(['list', 'get'], 'Drink');
		can(['create', 'list', 'get'], 'Comment');
		can(['update', 'delete'], 'Comment', { user_id: { $eq: user.id } });
	},
};
