import mjml2html from 'mjml';
import { ITemplateProvider } from '../ITemplate.provider';
import { EmailVerificationProps, ForgotPasswordProps } from '../template.dtos';
import { ServerError } from '@/shared/error/error.lib';
import { emailVerificationTemplate } from './views/emailVerification.template';
import { MJMLJsonObject } from './mjml.types';
import { forgotPasswordTemplate } from './views/forgotPassword.template';
import { logger } from '@/shared/logger';

export class MjmlProvider implements ITemplateProvider {
	private parseToHtml(id: string, template: MJMLJsonObject): string {
		const parseResult = mjml2html(template);
		if (parseResult.errors.length !== 0) {
			logger.error(`Failed to parse the template ${id}`);
			throw new ServerError('apiResponses.template.parseFailed', { path: 'MjmlProvider.parseToHtml' });
		}
		return parseResult.html;
	}

	emailVerification(data: EmailVerificationProps): string {
		const [id, template] = emailVerificationTemplate(data);
		const html = this.parseToHtml(id, template);
		return html;
	}
	forgotPassword(data: ForgotPasswordProps): string {
		const [id, template] = forgotPasswordTemplate(data);
		const html = this.parseToHtml(id, template);
		return html;
	}
}
