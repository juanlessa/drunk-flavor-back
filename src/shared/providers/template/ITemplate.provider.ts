import { EmailVerificationProps, ForgotPasswordProps } from './template.dtos';

export interface ITemplateProvider {
	emailVerification(data: EmailVerificationProps): Promise<string>;
	forgotPassword(data: ForgotPasswordProps): Promise<string>;
}
