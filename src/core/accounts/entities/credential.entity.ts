import { EntityMetadata } from '@/shared/types/entity.types';

/**
 * Credential =
 *     id: string
 *     userId: string (references User.id)
 *     passwordHash: string (bcrypt hash of the local password)
 *     createdAt: Date
 *     updatedAt: Date
 */
export type Credential = EntityMetadata & {
	userId: string;
	passwordHash: string;
};
