import mjml2html from 'mjml';
import { describe, expect, it } from 'vitest';
import { userSessionsRevokedTemplate } from './userSessionsRevoked.template';

describe('User Sessions Revoked Template', () => {
	it('renders the privacy-safe session revocation notice', async () => {
		const [id, template] = userSessionsRevokedTemplate({ userName: 'Taylor' });
		const parseResult = await mjml2html(template);

		expect(id).toBe('user-sessions-revoked');
		expect(parseResult.errors).toHaveLength(0);
		expect(parseResult.html).toContain('Hi Taylor');
		expect(parseResult.html).toContain('all of your Drunk Flavor sessions were ended by an administrative action');
		expect(parseResult.html).toContain('If you do not recognize this activity, contact support.');
		for (const privateValue of [
			'administrator@example.com',
			'policy violation details',
			'request-id-123',
			'sessionVersion',
			'session count',
			'access token',
		]) {
			expect(parseResult.html).not.toContain(privateValue);
		}
	});
});
