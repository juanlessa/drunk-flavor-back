import { EmailVerificationProps, PasswordResetProps } from './template.dtos';

export interface ITemplateProvider {
	emailVerification(data: EmailVerificationProps): string;
	passwordReset(data: PasswordResetProps): string;
}
