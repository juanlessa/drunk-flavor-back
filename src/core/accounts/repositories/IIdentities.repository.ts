import { Identity, IdentityProvider } from '@/core/accounts/entities/identity.entity';
import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';

export interface IIdentitiesRepository {
	findByProviderSub(provider: IdentityProvider, providerSub: string): Promise<Identity | null>;
	create(data: Omit<Identity, keyof DatabaseCommonInfo>): Promise<Identity>;
	touchLastLogin(id: string, date: Date): Promise<void>;
	findByUserId(userId: string): Promise<Identity[]>;
}
