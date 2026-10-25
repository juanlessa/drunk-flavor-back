import { Identity } from '@/core/accounts/entities/identity.entity';
import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';

export type CreateIdentity = Omit<Identity, keyof DatabaseCommonInfo>;
