import { describe, expect, it, vi } from 'vitest';
import { setLocalizedResponseHeaders } from './i18n.helpers';

const createReply = (vary?: unknown) => ({
	getHeader: vi.fn(() => vary),
	header: vi.fn(),
});

describe('setLocalizedResponseHeaders', () => {
	it('sets Content-Language and Vary when no Vary exists', () => {
		const reply = createReply();

		setLocalizedResponseHeaders(reply, 'pt');

		expect(reply.header).toHaveBeenCalledWith('Content-Language', 'pt');
		expect(reply.header).toHaveBeenCalledWith('Vary', 'Accept-Language');
	});

	it('appends to an existing Vary value', () => {
		const reply = createReply('Origin');

		setLocalizedResponseHeaders(reply, 'en');

		expect(reply.header).toHaveBeenCalledWith('Vary', 'Origin, Accept-Language');
	});

	it('appends to an array Vary value', () => {
		const reply = createReply(['Origin', 'Accept-Encoding']);

		setLocalizedResponseHeaders(reply, 'en');

		expect(reply.header).toHaveBeenCalledWith('Vary', 'Origin, Accept-Encoding, Accept-Language');
	});

	it('does not duplicate Accept-Language, case-insensitively', () => {
		const reply = createReply('origin, accept-language');

		setLocalizedResponseHeaders(reply, 'en');

		expect(reply.header).toHaveBeenCalledTimes(1);
		expect(reply.header).toHaveBeenCalledWith('Content-Language', 'en');
	});

	it('leaves a wildcard Vary untouched', () => {
		const reply = createReply('*');

		setLocalizedResponseHeaders(reply, 'en');

		expect(reply.header).toHaveBeenCalledTimes(1);
	});
});
