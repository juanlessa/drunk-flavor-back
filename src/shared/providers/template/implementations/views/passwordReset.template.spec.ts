import { describe, expect, it } from 'vitest';
import mjml2html from 'mjml';
import { PasswordResetProps } from '../../template.dtos';
import { passwordResetTemplate } from './passwordReset.template';
import { storeHtmlTemplate } from '../storeHtmlTemplate.helper';

describe('Password Reset Template', () => {
	it('should be able to generate the template', () => {
		const input: PasswordResetProps = {
			userName: 'John',
			resetLink: 'http://example.test/password-reset/',
		};
		const [id, template] = passwordResetTemplate(input);
		const parseResult = mjml2html(template);

		expect(parseResult.errors).toHaveLength(0);

		storeHtmlTemplate(id, parseResult.html);
	});
});
