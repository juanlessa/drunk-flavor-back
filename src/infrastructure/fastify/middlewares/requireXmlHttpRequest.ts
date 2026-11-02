import { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError } from '@/shared/error/error.lib';

export const REQUESTED_WITH_HEADER = 'x-requested-with';
export const REQUESTED_WITH_VALUE = 'XmlHttpRequest';

/**
 * CSRF guard for endpoints that receive an authorization code from the Google popup (GIS code model). Google
 * recommends requiring a custom header and checking its value: a cross-site form or navigation cannot set it, and a
 * cross-origin script can only send it after a CORS preflight that the CORS allowlist rejects.
 * See https://developers.google.com/identity/oauth2/web/guides/use-code-model#popup-mode
 */
export const requireXmlHttpRequest = async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
	if (request.headers[REQUESTED_WITH_HEADER] !== REQUESTED_WITH_VALUE) {
		throw new ForbiddenError('apiResponses.request.missingRequestedWithHeader', {
			path: 'requireXmlHttpRequest',
			cause: `Missing or unexpected ${REQUESTED_WITH_HEADER} header`,
		});
	}
};
