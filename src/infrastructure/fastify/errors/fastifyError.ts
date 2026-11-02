import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { ErrorResponse, FieldError, FieldErrorParams } from '@/shared/error/error.dtos';
import { logger } from '@/shared/providers/logger';
import { LocaleKey } from '@/shared/types/locale.types';
import { isLocaleKey } from '@/infrastructure/i18n';
import { FastifyError } from 'fastify';

/**
 * Locale keys for errors raised by Fastify itself and by its official plugins, indexed by `error.code`.
 * The codes are the stable contract; `error.message` is English free text and must never reach the client.
 */
const FASTIFY_ERROR_LOCALE_KEYS = {
	// fastify core
	FST_ERR_CTP_EMPTY_JSON_BODY: 'apiResponses.request.emptyBody',
	FST_ERR_CTP_INVALID_JSON_BODY: 'apiResponses.request.invalidJson',
	FST_ERR_CTP_BODY_TOO_LARGE: 'apiResponses.request.bodyTooLarge',
	FST_ERR_CTP_INVALID_MEDIA_TYPE: 'apiResponses.request.unsupportedMediaType',
	FST_ERR_CTP_INVALID_CONTENT_LENGTH: 'apiResponses.request.invalid',
	FST_ERR_BAD_URL: 'apiResponses.request.invalid',
	FST_ERR_NOT_FOUND: 'apiResponses.request.routeNotFound',
	// @fastify/multipart
	FST_REQ_FILE_TOO_LARGE: 'apiResponses.request.fileTooLarge',
	FST_FILES_LIMIT: 'apiResponses.request.tooManyParts',
	FST_PARTS_LIMIT: 'apiResponses.request.tooManyParts',
	FST_FIELDS_LIMIT: 'apiResponses.request.tooManyParts',
	FST_INVALID_MULTIPART_CONTENT_TYPE: 'apiResponses.request.invalidMultipart',
	FST_NO_FORM_DATA: 'apiResponses.request.invalidMultipart',
	FST_PROTO_VIOLATION: 'apiResponses.request.invalidMultipart',
	FST_MP_PREMATURE_CLOSE: 'apiResponses.request.invalidMultipart',
	FST_INVALID_JSON_FIELD_ERROR: 'apiResponses.request.invalidMultipart',
} as const satisfies Record<string, LocaleKey>;

const hasMappedLocaleKey = (code: string): code is keyof typeof FASTIFY_ERROR_LOCALE_KEYS =>
	Object.hasOwn(FASTIFY_ERROR_LOCALE_KEYS, code);

export const instanceOfFastifyError = (error: unknown): error is FastifyError => {
	return 'code' in (error as FastifyError) && 'name' in (error as FastifyError) && error instanceof Error;
};

/** Converts a JSON pointer such as `/address/0/street` into `address.0.street`. Root (`/`) becomes `''`. */
const toFieldPath = (instancePath: string): string => instancePath.replace(/^\//, '').replaceAll('/', '.');

/** Exposes the rule limits of an issue (`minimum`/`maximum` in Zod) as `min`/`max`, keeping the schema as the single source of the number. */
const toFieldParams = (params: Record<string, unknown> | undefined): FieldErrorParams | undefined => {
	const min = params?.minimum;
	const max = params?.maximum;
	const fieldParams: FieldErrorParams = {
		...(typeof min === 'number' && { min }),
		...(typeof max === 'number' && { max }),
	};
	return Object.keys(fieldParams).length > 0 ? fieldParams : undefined;
};

const toFieldErrors = (error: FastifyError): FieldError[] =>
	(error.validation ?? []).map((issue) => {
		const params = toFieldParams(issue.params);
		return {
			location: error.validationContext ?? 'body',
			path: toFieldPath(issue.instancePath),
			// Schemas carry a locale key as the issue message. Issues without a custom message (library defaults
			// such as "Too small: expected number to be >=1") are English free text and get a generic key instead.
			localeKey: isLocaleKey(issue.message) ? issue.message : 'apiResponses.validation.invalidValue',
			...(params && { params }),
		};
	});

const resolveLocaleKey = (error: FastifyError, statusCode: number): LocaleKey => {
	if (hasMappedLocaleKey(error.code)) return FASTIFY_ERROR_LOCALE_KEYS[error.code];
	// Plugins configured with locale keys as messages (for example @fastify/jwt) already carry a valid key.
	if (isLocaleKey(error.message)) return error.message;
	return statusCode >= HTTP_STATUS.internal_server_error
		? 'apiResponses.internalServerError'
		: 'apiResponses.request.invalid';
};

export const handleFastifyError = (error: FastifyError): ErrorResponse => {
	if (error.validation && error.validation.length > 0) {
		logger.warn(
			{ name: error.name, validationContext: error.validationContext, issues: error.validation },
			'fastify validation failed',
		);
		const errors = toFieldErrors(error);
		// The root describes the failure as a whole; `errors` is the single source of per-field detail.
		return { statusCode: HTTP_STATUS.bad_request, localeKey: 'apiResponses.validation.failed', errors };
	}

	logger.error({ err: error }, `fastify.handleFastifyError(${error.name}): ${error.message}.`);
	const statusCode = error.statusCode || HTTP_STATUS.internal_server_error;
	return { statusCode, localeKey: resolveLocaleKey(error, statusCode) };
};
