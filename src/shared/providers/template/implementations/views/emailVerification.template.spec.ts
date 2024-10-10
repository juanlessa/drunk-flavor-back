import { describe, expect, it } from 'vitest';
import { emailVerificationTemplate } from './emailVerification.template';
import { EmailVerificationProps } from '../../template.dtos';
import mjml2html from 'mjml';
import { storeHtmlTemplate } from '../storeHtmlTemplate.helper';

describe('Email Verification Template', () => {
	it('should be able to generate the template', () => {
		const input: EmailVerificationProps = {
			userName: 'John',
			verificationLink: 'http://example.test/email-verification/',
		};
		const [id, template] = emailVerificationTemplate(input);
		const parseResult = mjml2html(template);

		expect(parseResult.errors).toHaveLength(0);

		storeHtmlTemplate(id, parseResult.html);
	});
});
