import { vi } from 'vitest';
import { type ITemplateProvider } from '../ITemplate.provider';
import {
	type EmailVerificationProps,
	type ForgotPasswordProps,
	type OwnershipTransferChangedProps,
	type OwnershipTransferInvitationProps,
	type UserSessionsRevokedProps,
} from '../template.dtos';

/** Deterministic HTML returned by each template, so tests can assert what reaches the email queue. */
export const MOCK_TEMPLATE_HTML = {
	emailVerification: 'email-verification-template',
	forgotPassword: 'forgot-password-template',
	ownershipTransferInvitation: 'ownership-transfer-invitation-template',
	ownershipTransferChanged: 'ownership-transfer-changed-template',
	userSessionsRevoked: 'user-sessions-revoked-template',
} as const;

/**
 * Test double for unit tests that do not need real MJML rendering. Each template is a `vi.fn`, so tests can assert
 * calls or override results (for example `mockRejectedValueOnce`) while the default output stays deterministic.
 */
export class MockTemplateProvider implements ITemplateProvider {
	readonly emailVerification = vi.fn(async (_data: EmailVerificationProps) => MOCK_TEMPLATE_HTML.emailVerification);
	readonly forgotPassword = vi.fn(async (_data: ForgotPasswordProps) => MOCK_TEMPLATE_HTML.forgotPassword);
	readonly ownershipTransferInvitation = vi.fn(
		async (_data: OwnershipTransferInvitationProps) => MOCK_TEMPLATE_HTML.ownershipTransferInvitation,
	);
	readonly ownershipTransferChanged = vi.fn(
		async (_data: OwnershipTransferChangedProps) => MOCK_TEMPLATE_HTML.ownershipTransferChanged,
	);
	readonly userSessionsRevoked = vi.fn(
		async (_data: UserSessionsRevokedProps) => MOCK_TEMPLATE_HTML.userSessionsRevoked,
	);
}
