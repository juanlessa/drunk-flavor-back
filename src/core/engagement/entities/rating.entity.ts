import { EntityMetadata } from '@/shared/types/entity.types';

export type Rating = EntityMetadata & {
	drinkId: string;
	userId: string;
	value: number;
};
