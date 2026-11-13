import { describe, expect, it } from 'vitest';
import { buildAppUrl } from './appUrl.helper';

describe('buildAppUrl', () => {
	it('should build the origin from the host and port', () => {
		expect(buildAppUrl({ API_HOST: 'localhost', API_PORT: 3333 })).toBe('http://localhost:3333');
	});
});
