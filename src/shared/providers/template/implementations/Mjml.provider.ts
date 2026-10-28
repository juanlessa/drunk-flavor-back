import mjml2html from 'mjml';
import { ITemplateProvider } from '../ITemplate.provider';
import {
	EmailVerificationProps,
	ForgotPasswordProps,
	OwnershipTransferChangedProps,
	OwnershipTransferInvitationProps,
} from '../template.dtos';
import { ServerError } from '@/shared/error/error.lib';
import { emailVerificationTemplate } from './views/emailVerification.template';
import { MJMLJsonObject } from './mjml.types';
import { forgotPasswordTemplate } from './views/forgotPassword.template';
import { ownershipTransferChangedTemplate } from './views/ownershipTransferChanged.template';
import { ownershipTransferInvitationTemplate } from './views/ownershipTransferInvitation.template';
import { logger } from '@/shared/providers/logger';

export class MjmlProvider implements ITemplateProvider {
	private async parseToHtml(id: string, template: MJMLJsonObject): Promise<string> {
		const parseResult = await mjml2html(template);
		if (parseResult.errors.length !== 0) {
			logger.error(`Failed to parse the template ${id}`);
			throw new ServerError('apiResponses.template.parseFailed', { path: 'MjmlProvider.parseToHtml' });
		}
		return parseResult.html;
	}

	async emailVerification(data: EmailVerificationProps): Promise<string> {
		const [id, template] = emailVerificationTemplate(data);
		return this.parseToHtml(id, template);
	}

	async forgotPassword(data: ForgotPasswordProps): Promise<string> {
		const [id, template] = forgotPasswordTemplate(data);
		return this.parseToHtml(id, template);
	}

	async ownershipTransferInvitation(data: OwnershipTransferInvitationProps): Promise<string> {
		const [id, template] = ownershipTransferInvitationTemplate(data);
		return this.parseToHtml(id, template);
	}

	async ownershipTransferChanged(data: OwnershipTransferChangedProps): Promise<string> {
		const [id, template] = ownershipTransferChangedTemplate(data);
		return this.parseToHtml(id, template);
	}
}
