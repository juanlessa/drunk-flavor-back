import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';

export type Rating = DatabaseCommonInfo & {
	drink_id: string;
	user_id: string;
	value: number;
};
