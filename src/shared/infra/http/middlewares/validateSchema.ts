import { z } from 'zod';
import { AppNextFunction, AppRequest, AppResponse } from '../types';
import { BadRequestError } from '@shared/errors/error.lib';

export const validateSchema =
	<T>(schema: z.ZodTypeAny) =>
	(request: AppRequest, _response: AppResponse, next: AppNextFunction) => {
		const data: T = request.body;

		const result = schema.safeParse(data);

		if (!result.success) {
			const { issues } = result.error;
			throw new BadRequestError(issues[0].message, { path: 'validateSchema.middleware' });
		}

		request.body = result.data;

		next();
	};
