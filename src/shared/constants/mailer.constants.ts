import { env } from '@/env';

export const MAIL_SENDERS = {
	noReply: `no-reply@${env.SMTP_DOMAIN}`,
	support: `support@${env.SMTP_DOMAIN}`,
} as const;
