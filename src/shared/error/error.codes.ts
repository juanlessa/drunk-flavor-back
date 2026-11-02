import { HTTP_STATUS } from '@/shared/constants/http.constants';
import type { LocaleKey } from '@/shared/types/locale.types';

/**
 * Stable, language-independent error groups. Clients branch on these when the HTTP status alone is not enough
 * (for example, telling apart two different 401 situations).
 *
 * This list is a public contract and is append-only: a published code is never renamed, removed or reused for a
 * different meaning (enforced by `error-codes.lock.json`). Add a code only when some client needs to behave
 * differently for it; otherwise let the error fall into the generic code of its HTTP status.
 */
export const ERROR_CODES = [
	// Generic groups, resolved from the HTTP status when a locale key has no specific group.
	'VALIDATION_FAILED',
	'BAD_REQUEST',
	'UNAUTHORIZED',
	'FORBIDDEN',
	'NOT_FOUND',
	'CONFLICT',
	'TOO_MANY_REQUESTS',
	'INTERNAL_ERROR',
	// Specific groups, where the status alone is not enough.
	'INVALID_CREDENTIALS',
	'SESSION_REVOKED',
	'RECENT_AUTHENTICATION_REQUIRED',
	'PROFILE_INCOMPLETE',
	'GOOGLE_EMAIL_NOT_VERIFIED',
	'ACCOUNT_LINK_REQUIRED',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** UPPER_SNAKE_CASE, up to 63 characters, no leading digit or edge underscores (same rule as Google's ErrorInfo.reason). */
export const ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]{0,61}[A-Z0-9]$/;

/**
 * Locale keys that belong to a specific group regardless of the HTTP status they are thrown with.
 * The `satisfies` clause makes the compiler flag a key that was renamed or removed from the catalog.
 */
export const ERROR_CODE_BY_LOCALE_KEY = {
	'apiResponses.validation.failed': 'VALIDATION_FAILED',
	'apiResponses.auth.invalidCredentials': 'INVALID_CREDENTIALS',
	'apiResponses.auth.tooManyRequests': 'TOO_MANY_REQUESTS',
	'apiResponses.auth.sessionRevoked': 'SESSION_REVOKED',
	'apiResponses.auth.profileIncomplete': 'PROFILE_INCOMPLETE',
	'apiResponses.auth.googleEmailNotVerified': 'GOOGLE_EMAIL_NOT_VERIFIED',
	'apiResponses.auth.accountLinkRequired': 'ACCOUNT_LINK_REQUIRED',
	'apiResponses.profile.recentAuthenticationRequired': 'RECENT_AUTHENTICATION_REQUIRED',
} as const satisfies Partial<Record<LocaleKey, ErrorCode>>;

const hasSpecificCode = (localeKey: LocaleKey): localeKey is keyof typeof ERROR_CODE_BY_LOCALE_KEY =>
	Object.hasOwn(ERROR_CODE_BY_LOCALE_KEY, localeKey);

const resolveCodeFromStatus = (statusCode: number): ErrorCode => {
	if (statusCode >= HTTP_STATUS.internal_server_error) return 'INTERNAL_ERROR';

	switch (statusCode) {
		case HTTP_STATUS.unauthorized:
			return 'UNAUTHORIZED';
		case HTTP_STATUS.forbidden:
			return 'FORBIDDEN';
		case HTTP_STATUS.not_found:
			return 'NOT_FOUND';
		case HTTP_STATUS.conflict:
			return 'CONFLICT';
		case HTTP_STATUS.too_many_requests:
			return 'TOO_MANY_REQUESTS';
		default:
			return 'BAD_REQUEST';
	}
};

/** Resolves the error group: a specific group for the locale key when one exists, otherwise the generic group of the status. */
export const resolveErrorCode = (localeKey: LocaleKey, statusCode: number): ErrorCode =>
	hasSpecificCode(localeKey) ? ERROR_CODE_BY_LOCALE_KEY[localeKey] : resolveCodeFromStatus(statusCode);
