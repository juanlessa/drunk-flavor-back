import { UserStatus } from '@/core/accounts/entities/user.entity';
import { UserStatuses } from '@/core/accounts/constants/user.constants';

/**
 * Mongoose `required` option for `name`/`surname`. Names are mandatory for every
 * account except an `incomplete_profile` one, which is created before the user
 * has supplied them (e.g. a Google sign-in whose token omitted a name part).
 */
export function isProfileNameRequired(this: { status?: UserStatus }): boolean {
	return this.status !== UserStatuses.incomplete_profile;
}
