import { MongoServerError } from 'mongodb';
import { ConflictError } from '@/shared/error/error.lib';
import { LocaleKey } from '@/shared/types/locale.types';

/**
 * Returns true when `error` is a MongoDB duplicate-key (11000) error whose
 * violated index name is one of `indexNames`.
 */
export const isDuplicateKeyError = (error: unknown, indexNames: readonly string[]): error is MongoServerError =>
	error instanceof MongoServerError &&
	error.code === 11000 &&
	indexNames.some((name) => error.message.includes(name));

/**
 * If `error` is a duplicate-key violation on one of `indexNames`, throw a domain
 * ConflictError (409) carrying `localeKey`. Otherwise rethrow `error` unchanged.
 *
 * Always throws; the `never` return type lets callers write it inside a catch
 * block as `mapDuplicateKeyError(error, ...)` and keep the surrounding method's
 * return type intact.
 */
export const mapDuplicateKeyError = (
	error: unknown,
	indexNames: readonly string[],
	localeKey: LocaleKey,
	options: { path: string; cause?: string },
): never => {
	if (isDuplicateKeyError(error, indexNames)) {
		throw new ConflictError(localeKey, {
			path: options.path,
			cause: options.cause ?? 'Unique translation-name index violation',
		});
	}
	throw error;
};
