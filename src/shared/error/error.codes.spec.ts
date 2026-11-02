import { describe, expect, it } from 'vitest';
import { i18n } from '@/infrastructure/i18n';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import type { LocaleKey } from '@/shared/types/locale.types';
import { ERROR_CODE_BY_LOCALE_KEY, ERROR_CODE_PATTERN, ERROR_CODES, resolveErrorCode } from './error.codes';
import publishedCodes from './error-codes.lock.json';

describe('ERROR_CODES', () => {
	it('uses UPPER_SNAKE_CASE with at most 63 characters', () => {
		for (const code of ERROR_CODES) {
			expect(code, `"${code}" is not a valid error code`).toMatch(ERROR_CODE_PATTERN);
			expect(code.length).toBeLessThanOrEqual(63);
		}
	});

	it('has no duplicates', () => {
		expect(new Set(ERROR_CODES).size).toBe(ERROR_CODES.length);
	});

	it('never drops or renames a published code', () => {
		const removed = publishedCodes.filter((code) => !(ERROR_CODES as readonly string[]).includes(code));

		expect(removed, 'Published error codes are a public contract: add new codes, never remove or rename').toEqual(
			[],
		);
	});

	it('records every code in the lock file', () => {
		const unrecorded = ERROR_CODES.filter((code) => !publishedCodes.includes(code));

		expect(unrecorded, 'New error codes must be added to error-codes.lock.json').toEqual([]);
	});
});

describe('resolveErrorCode', () => {
	it.each([
		[HTTP_STATUS.bad_request, 'BAD_REQUEST'],
		[HTTP_STATUS.unauthorized, 'UNAUTHORIZED'],
		[HTTP_STATUS.forbidden, 'FORBIDDEN'],
		[HTTP_STATUS.not_found, 'NOT_FOUND'],
		[HTTP_STATUS.conflict, 'CONFLICT'],
		[HTTP_STATUS.too_many_requests, 'TOO_MANY_REQUESTS'],
		[HTTP_STATUS.internal_server_error, 'INTERNAL_ERROR'],
		[HTTP_STATUS.service_unavailable, 'INTERNAL_ERROR'],
		[413, 'BAD_REQUEST'],
		[415, 'BAD_REQUEST'],
	] as const)('falls back to the generic group of status %i', (status, code) => {
		expect(resolveErrorCode('apiResponses.users.notFound', status)).toBe(code);
	});

	it.each(Object.entries(ERROR_CODE_BY_LOCALE_KEY))('resolves %s to %s', (localeKey, code) => {
		expect(resolveErrorCode(localeKey as LocaleKey, HTTP_STATUS.bad_request)).toBe(code);
	});

	it('lets a specific group win over the status the error was thrown with', () => {
		expect(resolveErrorCode('apiResponses.auth.invalidCredentials', HTTP_STATUS.unauthorized)).toBe(
			'INVALID_CREDENTIALS',
		);
		expect(resolveErrorCode('apiResponses.auth.invalidCredentials', HTTP_STATUS.forbidden)).toBe(
			'INVALID_CREDENTIALS',
		);
		expect(resolveErrorCode('apiResponses.auth.tooManyRequests', HTTP_STATUS.forbidden)).toBe('TOO_MANY_REQUESTS');
		expect(resolveErrorCode('apiResponses.auth.tooManyRequests', HTTP_STATUS.too_many_requests)).toBe(
			'TOO_MANY_REQUESTS',
		);
	});

	it('maps only locale keys that exist in the catalog to declared codes', () => {
		for (const [localeKey, code] of Object.entries(ERROR_CODE_BY_LOCALE_KEY)) {
			expect(i18n.has(localeKey)).toBe(true);
			expect(ERROR_CODES as readonly string[]).toContain(code);
		}
	});

	it('does not resolve prototype keys as specific groups', () => {
		expect(resolveErrorCode('constructor' as LocaleKey, HTTP_STATUS.not_found)).toBe('NOT_FOUND');
	});
});
