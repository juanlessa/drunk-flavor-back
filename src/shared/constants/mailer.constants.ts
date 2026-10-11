import { parseSmtpEnv } from '@/env/smtp';

const smtp = parseSmtpEnv();

export const MAIL_SENDERS = {
	noReply: `no-reply@${smtp.SMTP_DOMAIN}`,
	support: `support@${smtp.SMTP_DOMAIN}`,
} as const;
