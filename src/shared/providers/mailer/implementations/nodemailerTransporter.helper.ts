import { readSmtpConnection, type SmtpConnection } from '@/env/smtp';
import nodemailer, { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

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

/**
 * Builds the transporter for the given SMTP connection. The environment is read
 * only when no connection is provided, at call time rather than at import time,
 * so a connection that is only known at runtime (for example an ephemeral
 * MailDev port) can be supplied.
 */
export const nodemailerTransporter = (connection: SmtpConnection = readSmtpConnection()): Transporter => {
	const auth =
		connection.username && connection.password
			? {
					user: connection.username,
					pass: connection.password,
				}
			: undefined;

	const options: SMTPTransport.Options = {
		host: connection.host,
		port: connection.port,
		auth,
		...resolveSecurityOptions(connection.port),
	};

	return nodemailer.createTransport(options);
};
