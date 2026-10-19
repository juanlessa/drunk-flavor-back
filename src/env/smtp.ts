import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

/** Environments where the mailer credentials are allowed to be empty. */
const SMTP_OPTIONAL_ENVIRONMENTS: readonly NodeEnv[] = ['testing', 'e2e'];

const SMTP_DEFAULT_DOMAIN = 'drunkflavor.com';
const SMTP_DEFAULT_PORT = 465;

/** Secure SMTP ports allowed in production: 465 (implicit TLS) and 587 (STARTTLS). */
const SMTP_SECURE_PORTS = [465, 587] as const;

const requiredUnlessTestEnv = (nodeEnv: NodeEnv, variableName: string) =>
	SMTP_OPTIONAL_ENVIRONMENTS.includes(nodeEnv)
		? z.string().default('')
		: z.string().min(1, `${variableName} is required in the "${nodeEnv}" environment`);

/**
 * Builds the SMTP port schema. In production, only secure ports (465/587) are
 * accepted; any other value fails validation. Other environments accept any
 * valid port so a local dev mail server (e.g. Mailpit) can run on a plain port.
 */
const buildSmtpPortSchema = (nodeEnv: NodeEnv) => {
	const base = z.coerce.number().int().min(1).max(65535).default(SMTP_DEFAULT_PORT);

	if (nodeEnv !== 'production') {
		return base;
	}

	return base.refine((port) => SMTP_SECURE_PORTS.includes(port as (typeof SMTP_SECURE_PORTS)[number]), {
		message: `SMTP_PORT must be one of ${SMTP_SECURE_PORTS.join(' or ')} in the "production" environment`,
	});
};

export const buildSmtpSchema = (nodeEnv: NodeEnv) =>
	z.object({
		SMTP_DOMAIN: z.string().min(1).default(SMTP_DEFAULT_DOMAIN),
		SMTP_PORT: buildSmtpPortSchema(nodeEnv),
		SMTP_HOST: requiredUnlessTestEnv(nodeEnv, 'SMTP_HOST'),
		SMTP_USERNAME: requiredUnlessTestEnv(nodeEnv, 'SMTP_USERNAME'),
		SMTP_PASSWORD: requiredUnlessTestEnv(nodeEnv, 'SMTP_PASSWORD'),
	});

export type SmtpSchema = z.infer<ReturnType<typeof buildSmtpSchema>>;

export const parseSmtpEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): SmtpSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildSmtpSchema(resolvedNodeEnv).parse(source);
};
