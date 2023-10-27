import { SafeParseError, z } from 'zod';
import AppError from '@errors/AppError';
import { AppNextFunction, AppRequest, AppResponse } from '../types';

const validateSchema =
	<T>(schema: z.ZodTypeAny) =>
	(request: AppRequest, response: AppResponse, next: AppNextFunction) => {
		const data: T = request.body;

		const result = schema.safeParse(data);

		if (!result.success) {
			const { error } = result as SafeParseError<T>;
			throw new AppError(error.issues[0].message);
		}

		request.body = result.data;

		next();
	};

export { validateSchema };
