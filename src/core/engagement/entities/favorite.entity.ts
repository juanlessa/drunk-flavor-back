import { EntityMetadata } from '@/shared/types/entity.types';

export type Favorite = Omit<EntityMetadata, 'updatedAt'> & {
	drinkId: string;
	userId: string;
};
