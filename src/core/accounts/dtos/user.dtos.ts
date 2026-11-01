import { User, UserStatus } from '@/core/accounts/entities/user.entity';
import { Role } from '@/shared/accessControl/roles';
import { EntityMetadata } from '@/shared/types/entity.types';

/**
 * `emailVerified` and `sessionVersion` are optional because persistence owns their initial values: a new user
 * starts unverified (`false`) at session version `1`. Callers set `emailVerified` explicitly when a provider has
 * already verified the email.
 */
export type CreateUser = Omit<User, keyof EntityMetadata | 'emailVerified' | 'sessionVersion'> &
	Partial<Pick<User, 'emailVerified' | 'sessionVersion'>>;

/** `sessionVersion` is excluded on purpose: use `IUsersRepository.incrementSessionVersion` so markers are raised. */
export type UpdateUser = Pick<User, 'id'> & Partial<Omit<User, keyof EntityMetadata | 'sessionVersion'>>;
