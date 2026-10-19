import { parseSmtpEnv } from '@/env/smtp';

const { SMTP_DOMAIN } = parseSmtpEnv();

export const MAIL_SENDERS = {
	noReply: `no-reply@${SMTP_DOMAIN}`,
	support: `support@${SMTP_DOMAIN}`,
	admin: `admin@${SMTP_DOMAIN}`,
} as const;
