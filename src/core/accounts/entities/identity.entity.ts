import { EntityMetadata } from '@/shared/types/entity.types';
import { IdentityProviders } from '../constants/identity.constants';

export type IdentityProvider = (typeof IdentityProviders)[keyof typeof IdentityProviders];

/**
 * Identity =
 *     id: string
 *     userId: string (references User.id)
 *     provider: IdentityProvider ("google")
 *     providerSubject: string (stable subject id from the provider; the link key)
 *     email?: string (email reported by the provider; may differ from User.email)
 *     isEmailVerified?: boolean (whether the provider verified that email)
 *     pictureUrl?: string (avatar URL reported by the provider)
 *     lastLoginAt?: Date
 *     createdAt: Date
 *     updatedAt: Date
 */
export type Identity = EntityMetadata & {
	userId: string;
	provider: IdentityProvider;
	providerSubject: string;
	email?: string;
	isEmailVerified?: boolean;
	pictureUrl?: string;
	lastLoginAt?: Date;
};
