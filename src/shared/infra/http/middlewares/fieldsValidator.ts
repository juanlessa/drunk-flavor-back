import { SafeParseError, z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import AppError from '@errors/AppError';

const validateSchema =
	<T>(schema: z.ZodTypeAny) =>
	(request: Request, response: Response, next: NextFunction) => {
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
