import { Identity, IdentityProvider } from '@/core/accounts/entities/identity.entity';
import { CreateIdentity } from '@/core/accounts/dtos/identity.dtos';

export interface IIdentitiesRepository {
	findByProviderSub(provider: IdentityProvider, providerSub: string): Promise<Identity | null>;
	create(data: CreateIdentity): Promise<Identity>;
	touchLastLogin(id: string, date: Date): Promise<void>;
	findByUserId(userId: string): Promise<Identity[]>;
	deleteByUserId(userId: string): Promise<void>;
}
