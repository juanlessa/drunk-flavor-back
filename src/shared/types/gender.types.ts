import { Genders } from '@/shared/constants/gender.constants';

export type Gender = (typeof Genders)[keyof typeof Genders];
