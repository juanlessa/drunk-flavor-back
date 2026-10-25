import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';
import { IdentityProviders } from '../constants/identity.constants';

export type IdentityProvider = (typeof IdentityProviders)[keyof typeof IdentityProviders];

/**
 * Identity =
 *     _id: ObjectId
 *     user_id: string (references User._id)
 *     provider: IdentityProvider ("google")
 *     provider_sub: string (stable subject id from the provider; the link key)
 *     email?: string (email reported by the provider; may differ from User.email)
 *     email_verified?: boolean (whether the provider verified that email)
 *     picture?: string (avatar URL reported by the provider)
 *     last_login_at?: Date
 *     created_at: Date
 *     updated_at: Date
 */
export type Identity = DatabaseCommonInfo & {
	user_id: string;
	provider: IdentityProvider;
	provider_sub: string;
	email?: string;
	email_verified?: boolean;
	picture?: string;
	last_login_at?: Date;
};
