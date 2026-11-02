import { describe, expect, it } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError } from '@/shared/error/error.lib';
import { requireXmlHttpRequest } from './requireXmlHttpRequest';

const requestWith = (headers: Record<string, string>) => ({ headers }) as unknown as FastifyRequest;

describe('requireXmlHttpRequest', () => {
	it('accepts a request with the expected X-Requested-With header', async () => {
		await expect(
			requireXmlHttpRequest(requestWith({ 'x-requested-with': 'XmlHttpRequest' }), {} as FastifyReply),
		).resolves.toBeUndefined();
	});

	it.each<Record<string, string>>([{}, { 'x-requested-with': '' }, { 'x-requested-with': 'fetch' }])(
		'rejects a request without the expected header (%o)',
		async (headers) => {
			await expect(requireXmlHttpRequest(requestWith(headers), {} as FastifyReply)).rejects.toBeInstanceOf(
				ForbiddenError,
			);
		},
	);
});
