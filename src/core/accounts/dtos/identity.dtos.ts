import { Identity } from '@/core/accounts/entities/identity.entity';
import { EntityMetadata } from '@/shared/types/entity.types';

export type CreateIdentity = Omit<Identity, keyof EntityMetadata>;
