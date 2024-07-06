import { z } from 'zod';
import { AWS_S3_FIELDS } from './env.constants';
import { EnvType } from './env.types';

export const requireAwsFieldsForStorageS3 = (data: EnvType, ctx: z.RefinementCtx) => {
	if (data.STORAGE_TYPE === 's3') {
		AWS_S3_FIELDS.forEach((_field) => {
			const field = _field as keyof typeof data;
			if (!data[field]) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${field} is required when STORAGE_TYPE is 's3'`,
					path: [field],
				});
			}
		});
	}
};
