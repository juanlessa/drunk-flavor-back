import { Model, QueryFilter } from 'mongoose';

export const CREATED_BY_FIELD = 'created_by';
export const UPDATED_BY_FIELD = 'updated_by';

/** The index every catalog collection keeps to list the records of one creator. */
export const CREATED_BY_INDEX = { [CREATED_BY_FIELD]: 1 } as const;

/**
 * Authorship belongs to the record, not to the snapshots of it that other records embed (an ingredient embeds its
 * category and units, a drink embeds its ingredients and their units). A snapshot is written without it, so closing
 * an account has a single place to anonymize and a snapshot never tells who created what it copies.
 */
export const omitAuthorshipDeep = <T>(value: T): T => {
	if (Array.isArray(value)) return (value as unknown[]).map((item) => omitAuthorshipDeep(item)) as T;
	if (value === null || typeof value !== 'object' || value instanceof Date) return value;
	const prototype = Reflect.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== null) return value;
	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>)
			.filter(([key]) => key !== CREATED_BY_FIELD && key !== UPDATED_BY_FIELD)
			.map(([key, item]) => [key, omitAuthorshipDeep(item)]),
	) as T;
};

/**
 * Anonymizes the records a user wrote: the creator and the last editor are removed, and the record is otherwise left
 * as it is (its `updated_at` does not move). Returns how many records had the user as creator or last editor.
 *
 * `created_by` is immutable, so removing it takes `overwriteImmutable`.
 */
export const clearAuthorshipByUser = async <T>(model: Model<T>, userId: string): Promise<number> => {
	const involved = { $or: [{ [CREATED_BY_FIELD]: userId }, { [UPDATED_BY_FIELD]: userId }] } as QueryFilter<T>;
	const affected = await model.countDocuments(involved).exec();
	if (affected === 0) return 0;
	const options = { overwriteImmutable: true, timestamps: false } as const;
	await model
		.updateMany({ [CREATED_BY_FIELD]: userId } as QueryFilter<T>, { $unset: { [CREATED_BY_FIELD]: 1 } }, options)
		.exec();
	await model
		.updateMany({ [UPDATED_BY_FIELD]: userId } as QueryFilter<T>, { $unset: { [UPDATED_BY_FIELD]: 1 } }, options)
		.exec();
	return affected;
};
