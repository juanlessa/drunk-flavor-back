import { EmailVerificationProps, ForgotPasswordProps } from './template.dtos';

export interface ITemplateProvider {
	emailVerification(data: EmailVerificationProps): string;
	forgotPassword(data: ForgotPasswordProps): string;
}
