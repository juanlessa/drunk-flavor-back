import { userPermissionSchema } from '@/shared/accessControl/entities/user';
import { Middleware } from '../types/fastify.types';
import { defineAbilityFor } from '@/shared/accessControl';
import { ForbiddenError } from '@/shared/error/error.lib';
import { AppCanParameters } from '@/shared/accessControl/types';

export const verifyPermissions =
	(...args: AppCanParameters): Middleware =>
	async (request, _reply) => {
		const { id, role } = request.user;

		const user = userPermissionSchema.parse({ id, role });

		const { cannot } = defineAbilityFor(user);

		if (cannot(...args)) {
			throw new ForbiddenError('apiResponses.auth.invalidCredentials', {
				path: 'verifyPermissionsByToken.middleware',
			});
		}
	};
