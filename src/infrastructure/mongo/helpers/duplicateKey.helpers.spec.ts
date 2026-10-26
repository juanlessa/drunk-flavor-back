import { describe, expect, it } from 'vitest';
import { MongoServerError } from 'mongodb';
import { isDuplicateKeyError, mapDuplicateKeyError } from './duplicateKey.helpers';
import { BadRequestError } from '@/shared/error/error.lib';

const INDEX_NAMES = ['entity_translations_en_name_unique', 'entity_translations_pt_name_unique'] as const;

const buildDuplicateKeyError = (indexName: string): MongoServerError => {
	const error = new MongoServerError({
		message: `E11000 duplicate key error collection: db.entities index: ${indexName} dup key: { name: "x" }`,
	});
	error.code = 11000;
	return error;
};

describe('isDuplicateKeyError', () => {
	it('returns true for a MongoServerError 11000 whose message includes a provided index name', () => {
		const error = buildDuplicateKeyError('entity_translations_en_name_unique');
		expect(isDuplicateKeyError(error, INDEX_NAMES)).toBe(true);
	});

	it('returns false for a MongoServerError 11000 on an index name not in the provided set', () => {
		const error = buildDuplicateKeyError('some_other_unique_index');
		expect(isDuplicateKeyError(error, INDEX_NAMES)).toBe(false);
	});

	it('returns false for a MongoServerError with a non-11000 code', () => {
		const error = buildDuplicateKeyError('entity_translations_en_name_unique');
		error.code = 121;
		expect(isDuplicateKeyError(error, INDEX_NAMES)).toBe(false);
	});

	it('returns false for a non-MongoServerError', () => {
		const error = new Error('E11000 entity_translations_en_name_unique');
		expect(isDuplicateKeyError(error, INDEX_NAMES)).toBe(false);
	});
});

describe('mapDuplicateKeyError', () => {
	it('throws a BadRequestError with the supplied LocaleKey on a matching duplicate-key error', () => {
		const error = buildDuplicateKeyError('entity_translations_pt_name_unique');
		const act = () =>
			mapDuplicateKeyError(error, INDEX_NAMES, 'apiResponses.categories.alreadyExist', {
				path: 'Entities.repository',
			});

		expect(act).toThrow(BadRequestError);
		expect(act).toThrow('apiResponses.categories.alreadyExist');
	});

	it('rethrows the original error unchanged when it is not a matching duplicate-key error', () => {
		const error = buildDuplicateKeyError('some_other_unique_index');

		expect(() =>
			mapDuplicateKeyError(error, INDEX_NAMES, 'apiResponses.categories.alreadyExist', {
				path: 'Entities.repository',
			}),
		).toThrowError(error);
	});

	it('rethrows a non-Mongo error unchanged', () => {
		const error = new Error('unexpected');

		expect(() =>
			mapDuplicateKeyError(error, INDEX_NAMES, 'apiResponses.categories.alreadyExist', {
				path: 'Entities.repository',
			}),
		).toThrowError(error);
	});
});
