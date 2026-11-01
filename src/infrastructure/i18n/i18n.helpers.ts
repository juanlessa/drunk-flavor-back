type HeaderWriter = {
	getHeader: (name: string) => unknown;
	header: (name: string, value: string) => unknown;
};

const ACCEPT_LANGUAGE = 'Accept-Language';

const parseVary = (value: unknown): string[] => {
	const raw = Array.isArray(value) ? value.join(',') : typeof value === 'string' ? value : '';
	return raw
		.split(',')
		.map((field) => field.trim())
		.filter(Boolean);
};

/**
 * Marks a response whose body language depends on the request (RFC 9110 sections 12.5.4 and 12.5.5).
 * Appends to any existing `Vary` value instead of replacing it (for example `Origin` set by CORS).
 */
export const setLocalizedResponseHeaders = (reply: HeaderWriter, locale: string): void => {
	reply.header('Content-Language', locale);

	const vary = parseVary(reply.getHeader('vary'));
	if (vary.includes('*') || vary.some((field) => field.toLowerCase() === ACCEPT_LANGUAGE.toLowerCase())) return;
	reply.header('Vary', [...vary, ACCEPT_LANGUAGE].join(', '));
};
