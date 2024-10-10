import mjml2html from 'mjml';
import { ITemplateProvider } from '../ITemplate.provider';
import { EmailVerificationProps, PasswordResetProps } from '../template.dtos';
import { ServerError } from '@/shared/error/error.lib';
import { emailVerificationTemplate } from './views/emailVerification.template';
import { MJMLJsonObject } from './mjml.types';
import { passwordResetTemplate } from './views/passwordReset.template';
import { logger } from '@/shared/logger';

export class MjmlProvider implements ITemplateProvider {
	private parseToHtml(id: string, template: MJMLJsonObject): string {
		const parseResult = mjml2html(template);
		if (parseResult.errors.length !== 0) {
			logger.error(`Failed to parse the template ${id}`);
			throw new ServerError('Failed to parse the template', { path: 'MjmlProvider.parseToHtml' });
		}
		return parseResult.html;
	}

	emailVerification(data: EmailVerificationProps): string {
		const [id, template] = emailVerificationTemplate(data);
		const html = this.parseToHtml(id, template);
		return html;
	}
	passwordReset(data: PasswordResetProps): string {
		const [id, template] = passwordResetTemplate(data);
		const html = this.parseToHtml(id, template);
		return html;
	}
}
