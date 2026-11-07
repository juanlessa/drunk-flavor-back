import { Genders } from '@/shared/constants/gender.constants';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';

export const genderValidation = z.enum(Genders, {
	error: 'apiResponses.validation.invalidGender' satisfies LocaleKey,
});
