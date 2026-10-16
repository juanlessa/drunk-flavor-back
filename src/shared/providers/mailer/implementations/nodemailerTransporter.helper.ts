import { parseSmtpEnv } from '@/env/smtp';
import nodemailer, { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const smtp = parseSmtpEnv();

/** Implicit TLS port: the connection is encrypted from the handshake. */
const SMTP_IMPLICIT_TLS_PORT = 465;
/** STARTTLS submission port: the connection is upgraded to TLS after greeting. */
const SMTP_STARTTLS_PORT = 587;

/** Hardened TLS options shared by both secure modes. */
const SECURE_TLS_OPTIONS: SMTPTransport.Options['tls'] = {
	// Reject invalid or self-signed certificates.
	rejectUnauthorized: true,
	// Refuse legacy TLS versions.
	minVersion: 'TLSv1.2',
};

/**
 * Resolves transport security options based on the configured port:
 * - 465: implicit TLS (`secure: true`) with hardened TLS options.
 * - 587: STARTTLS forced (`requireTLS: true`) with hardened TLS options, so the
 *   connection aborts instead of falling back to plaintext on a downgrade.
 * - any other port: no TLS enforcement, intended for a local dev mail server
 *   (e.g. Mailpit) that does not offer TLS. Production restricts the port to
 *   465/587 at the env-validation layer, so this branch never runs there.
 */
const resolveSecurityOptions = (port: number): Partial<SMTPTransport.Options> => {
	if (port === SMTP_IMPLICIT_TLS_PORT) {
		return { secure: true, tls: SECURE_TLS_OPTIONS };
	}

	if (port === SMTP_STARTTLS_PORT) {
		return { secure: false, requireTLS: true, tls: SECURE_TLS_OPTIONS };
	}

	return {};
};

export const nodemailerTransporter = (): Transporter => {
	const auth =
		smtp.SMTP_USERNAME && smtp.SMTP_PASSWORD
			? {
					user: smtp.SMTP_USERNAME,
					pass: smtp.SMTP_PASSWORD,
				}
			: undefined;

	const options: SMTPTransport.Options = {
		host: smtp.SMTP_HOST,
		port: smtp.SMTP_PORT,
		auth,
		...resolveSecurityOptions(smtp.SMTP_PORT),
	};

	return nodemailer.createTransport(options);
};
