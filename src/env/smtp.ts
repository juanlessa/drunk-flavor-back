import './loadEnv';
import { z } from 'zod/v4';
import { type InstanceMode, parseControlEnv } from './control';
import { type NodeEnv, parseNodeEnv } from './node';

/** Environments where the SMTP host is allowed to be empty. */
const SMTP_HOST_OPTIONAL_ENVIRONMENTS: readonly NodeEnv[] = ['testing'];

/**
 * Environments where the SMTP credentials are allowed to be empty. Development
 * is included because local mail catchers such as MailDev accept connections
 * without authentication.
 */
const SMTP_CREDENTIALS_OPTIONAL_ENVIRONMENTS: readonly NodeEnv[] = ['development', 'testing'];

const SMTP_DEFAULT_DOMAIN = 'drunkflavor.com';
const SMTP_DEFAULT_PORT = 465;

/** Secure SMTP ports allowed in production: 465 (implicit TLS) and 587 (STARTTLS). */
const SMTP_SECURE_PORTS = [465, 587] as const;

/** Everything a transporter needs to reach an SMTP server. */
export type SmtpConnection = {
	host: string;
	port: number;
	username: string;
	password: string;
};

/**
 * Address of the local MailDev server (`npm run maildev`). It is used when
 * `SMTP_MODE` is `managed` and no connection is injected at runtime (for
 * example in development), and it backfills the flat `env.SMTP_*` keys.
 */
export const MANAGED_SMTP_CONNECTION: SmtpConnection = {
	host: 'localhost',
	port: 1025,
	username: '',
	password: '',
};

const requiredUnlessIn = (optionalEnvironments: readonly NodeEnv[], nodeEnv: NodeEnv, variableName: string) =>
	optionalEnvironments.includes(nodeEnv)
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

const smtpDomainShape = {
	SMTP_DOMAIN: z.string().min(1).default(SMTP_DEFAULT_DOMAIN),
};

/**
 * `managed`: a local MailDev server provides the mail transport, so no
 * connection variables are read. A development mail catcher must never receive
 * production mail, hence the production guard.
 */
const buildManagedSmtpSchema = (nodeEnv: NodeEnv) =>
	z
		.object({
			SMTP_MODE: z.literal('managed'),
			...smtpDomainShape,
		})
		.refine(() => nodeEnv !== 'production', {
			message: 'SMTP_MODE must be "external" in the "production" environment',
			path: ['SMTP_MODE'],
		});

/** `external`: connect to an already-running SMTP server described by `SMTP_*`. */
const buildExternalSmtpSchema = (nodeEnv: NodeEnv) =>
	z.object({
		SMTP_MODE: z.literal('external'),
		...smtpDomainShape,
		SMTP_PORT: buildSmtpPortSchema(nodeEnv),
		SMTP_HOST: requiredUnlessIn(SMTP_HOST_OPTIONAL_ENVIRONMENTS, nodeEnv, 'SMTP_HOST'),
		SMTP_USERNAME: requiredUnlessIn(SMTP_CREDENTIALS_OPTIONAL_ENVIRONMENTS, nodeEnv, 'SMTP_USERNAME'),
		SMTP_PASSWORD: requiredUnlessIn(SMTP_CREDENTIALS_OPTIONAL_ENVIRONMENTS, nodeEnv, 'SMTP_PASSWORD'),
	});

export const buildSmtpSchema = (nodeEnv: NodeEnv) =>
	z.discriminatedUnion('SMTP_MODE', [buildManagedSmtpSchema(nodeEnv), buildExternalSmtpSchema(nodeEnv)]);

export type SmtpSchema = z.infer<ReturnType<typeof buildSmtpSchema>>;

/**
 * Flattened SMTP shape (the `external` branch, which carries every connection
 * key). The composed `env` uses this so consumers can access `env.SMTP_*`
 * without needing to narrow on `SMTP_MODE`.
 */
export type FlatSmtpSchema = z.infer<ReturnType<typeof buildExternalSmtpSchema>>;

export const parseSmtpEnv = (
	source: NodeJS.ProcessEnv = process.env,
	mode?: InstanceMode,
	nodeEnv?: NodeEnv,
): SmtpSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	const resolvedMode = mode ?? parseControlEnv(source, resolvedNodeEnv).SMTP_MODE;
	return buildSmtpSchema(resolvedNodeEnv).parse({ ...source, SMTP_MODE: resolvedMode });
};

/**
 * Resolves the SMTP connection from the environment: the `SMTP_*` variables in
 * `external` mode, or the local MailDev address in `managed` mode.
 */
export const readSmtpConnection = (source: NodeJS.ProcessEnv = process.env): SmtpConnection => {
	const smtp = parseSmtpEnv(source);

	if (smtp.SMTP_MODE === 'managed') {
		return { ...MANAGED_SMTP_CONNECTION };
	}

	return {
		host: smtp.SMTP_HOST,
		port: smtp.SMTP_PORT,
		username: smtp.SMTP_USERNAME,
		password: smtp.SMTP_PASSWORD,
	};
};
