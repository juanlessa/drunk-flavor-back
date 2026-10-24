import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';

export const IdentityProviders = {
	google: 'google',
} as const;

export type IdentityProvider = (typeof IdentityProviders)[keyof typeof IdentityProviders];

export type Identity = DatabaseCommonInfo & {
	user_id: string;
	provider: IdentityProvider;
	provider_sub: string;
	email?: string;
	email_verified?: boolean;
	picture?: string;
	last_login_at?: Date;
};
