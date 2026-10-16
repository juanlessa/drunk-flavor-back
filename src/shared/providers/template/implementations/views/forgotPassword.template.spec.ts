import { describe, expect, it } from 'vitest';
import mjml2html from 'mjml';
import { ForgotPasswordProps } from '../../template.dtos';
import { forgotPasswordTemplate } from './forgotPassword.template';
import { storeHtmlTemplate } from '../storeHtmlTemplate.helper';

describe('Forgot Password Template', () => {
	it('should be able to generate the template', async () => {
		const input: ForgotPasswordProps = {
			userName: 'John',
			resetLink: 'http://example.test/reset-password/',
		};
		const [id, template] = forgotPasswordTemplate(input);
		const parseResult = await mjml2html(template);

		expect(parseResult.errors).toHaveLength(0);

		storeHtmlTemplate(id, parseResult.html);
	});
});
