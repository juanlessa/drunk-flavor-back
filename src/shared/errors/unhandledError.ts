import { resolveLoggerProvider } from '@shared/container/providers/logger';
import AppError from './AppError';

const logger = resolveLoggerProvider();

export const unhandledError = (error: unknown) => {
	const err = error as Error;
	logger.error(err, `UnhandledError(${err.name}): ${err.message}`);
	return new AppError('Internal Server Error', 500);
};
