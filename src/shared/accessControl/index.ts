import { AbilityBuilder, CreateAbility, createMongoAbility } from '@casl/ability';
import { UserPermissionModel } from './entities/user';
import { permissions } from './permissions';
import { AppAbility } from './types';
import { ServerError } from '../error/error.lib';
import { logger } from '../logger';

export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: UserPermissionModel) {
	const builder = new AbilityBuilder(createAppAbility);

	if (typeof permissions[user.role] !== 'function') {
		logger.error(`Permissions for role ${user.role} not found.`);
		throw new ServerError('apiResponses.internalServerError', {
			path: 'permissions.defineAbilityFor',
			cause: `Permissions for role ${user.role} not found.`,
		});
	}

	permissions[user.role](user, builder);

	const ability = builder.build({
		detectSubjectType: (subject) => {
			return subject.__typename;
		},
	});

	ability.can = ability.can.bind(ability);
	ability.cannot = ability.cannot.bind(ability);

	return ability;
}
