import {
	EmailVerificationProps,
	ForgotPasswordProps,
	OwnershipTransferChangedProps,
	OwnershipTransferInvitationProps,
} from './template.dtos';

export interface ITemplateProvider {
	emailVerification(data: EmailVerificationProps): Promise<string>;
	forgotPassword(data: ForgotPasswordProps): Promise<string>;
	ownershipTransferInvitation(data: OwnershipTransferInvitationProps): Promise<string>;
	ownershipTransferChanged(data: OwnershipTransferChangedProps): Promise<string>;
}
