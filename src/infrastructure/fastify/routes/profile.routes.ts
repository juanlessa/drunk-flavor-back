import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { requireRecentAuthentication } from '../middlewares/requireRecentAuthentication';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { Routes } from '../types/fastify.types';
import { createPasswordController } from '@/core/accounts/useCases/profile/createPassword/createPassword.controller';
import { createPasswordSchema } from '@/core/accounts/useCases/profile/createPassword/createPassword.schema';
import { deleteProfileController } from '@/core/accounts/useCases/profile/delete/deleteProfile.controller';
import { getProfileController } from '@/core/accounts/useCases/profile/get/getProfile.controller';
import { linkGoogleIdentityController } from '@/core/accounts/useCases/profile/linkGoogleIdentity/linkGoogleIdentity.controller';
import { linkGoogleIdentitySchema } from '@/core/accounts/useCases/profile/linkGoogleIdentity/linkGoogleIdentity.schema';
import { reauthenticateGoogleController } from '@/core/accounts/useCases/profile/reauthenticateGoogle/reauthenticateGoogle.controller';
import { reauthenticateGoogleSchema } from '@/core/accounts/useCases/profile/reauthenticateGoogle/reauthenticateGoogle.schema';
import { reauthenticatePasswordController } from '@/core/accounts/useCases/profile/reauthenticatePassword/reauthenticatePassword.controller';
import { reauthenticatePasswordSchema } from '@/core/accounts/useCases/profile/reauthenticatePassword/reauthenticatePassword.schema';
import { updateProfileController } from '@/core/accounts/useCases/profile/update/updateProfile.controller';
import { updateProfileSchema } from '@/core/accounts/useCases/profile/update/updateProfile.schema';
import { updateAvatarController } from '@/core/accounts/useCases/profile/updateAvatar/updateAvatar.controller';
import { updatePasswordController } from '@/core/accounts/useCases/profile/updatePassword/updatePassword.controller';
import { updatePasswordSchema } from '@/core/accounts/useCases/profile/updatePassword/updatePassword.schema';

const ONE_MINUTE = 60_000;
const BAN_THRESHOLD = 10;

const routes: Routes = (server) => {
	server.get(
		'/me',
		{
			schema: { tags: ['Profile'] },
			preValidation: [verifyAndRenewToken],
		},
		getProfileController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/me',
		{
			schema: { tags: ['Profile'], body: updateProfileSchema },
			preValidation: [verifyAndRenewToken],
		},
		updateProfileController,
	);

	server.patch(
		'/me/avatar',
		{
			schema: { tags: ['Profile'] },
			preValidation: [verifyAndRenewToken],
		},
		updateAvatarController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/me/identities/google',
		{
			config: { rateLimit: { max: 5, timeWindow: ONE_MINUTE, ban: BAN_THRESHOLD } },
			schema: { tags: ['Profile'], body: linkGoogleIdentitySchema },
			preValidation: [verifyAndRenewToken, requireRecentAuthentication],
		},
		linkGoogleIdentityController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/me/reauthentication/google',
		{
			config: { rateLimit: { max: 5, timeWindow: ONE_MINUTE, ban: BAN_THRESHOLD } },
			schema: { tags: ['Profile'], body: reauthenticateGoogleSchema },
			preValidation: [verifyAndRenewToken],
		},
		reauthenticateGoogleController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/me/reauthentication/password',
		{
			config: { rateLimit: { max: 5, timeWindow: ONE_MINUTE, ban: BAN_THRESHOLD } },
			schema: { tags: ['Profile'], body: reauthenticatePasswordSchema },
			preValidation: [verifyAndRenewToken],
		},
		reauthenticatePasswordController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/me/password',
		{
			config: { rateLimit: { max: 5, timeWindow: ONE_MINUTE, ban: BAN_THRESHOLD } },
			schema: { tags: ['Profile'], body: createPasswordSchema },
			preValidation: [verifyAndRenewToken, requireRecentAuthentication],
		},
		createPasswordController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/me/password',
		{
			config: { rateLimit: { max: 5, timeWindow: ONE_MINUTE, ban: BAN_THRESHOLD } },
			schema: { tags: ['Profile'], body: updatePasswordSchema },
			preValidation: [verifyAndRenewToken],
		},
		updatePasswordController,
	);

	server.withTypeProvider<ZodTypeProvider>().delete(
		'/me',
		{
			schema: { tags: ['Profile'] },
			preValidation: [verifyAndRenewToken, requireRecentAuthentication],
		},
		deleteProfileController,
	);
};

export const profileRoutes = pluginGenerator(routes);
