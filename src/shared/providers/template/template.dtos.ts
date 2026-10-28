export type EmailVerificationProps = {
	userName: string;
	verificationLink: string;
};

export type ForgotPasswordProps = {
	userName: string;
	resetLink: string;
};

export type OwnershipTransferInvitationProps = {
	userName: string;
	acceptanceLink: string;
};

export type OwnershipTransferChangedProps = {
	userName: string;
	role: 'owner' | 'admin';
};
