import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

/** Environments where the mailer credentials are allowed to be empty. */
const SMTP_OPTIONAL_ENVIRONMENTS: readonly NodeEnv[] = ['testing', 'e2e'];

const SMTP_DEFAULT_DOMAIN = 'drunkflavor.com';
const SMTP_DEFAULT_PORT = 587;

const requiredUnlessTestEnv = (nodeEnv: NodeEnv, variableName: string) =>
	SMTP_OPTIONAL_ENVIRONMENTS.includes(nodeEnv)
		? z.string().default('')
		: z.string().min(1, `${variableName} is required in the "${nodeEnv}" environment`);

export const buildSmtpSchema = (nodeEnv: NodeEnv) =>
	z.object({
		SMTP_DOMAIN: z.string().min(1).default(SMTP_DEFAULT_DOMAIN),
		SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(SMTP_DEFAULT_PORT),
		SMTP_HOST: requiredUnlessTestEnv(nodeEnv, 'SMTP_HOST'),
		SMTP_USERNAME: requiredUnlessTestEnv(nodeEnv, 'SMTP_USERNAME'),
		SMTP_PASSWORD: requiredUnlessTestEnv(nodeEnv, 'SMTP_PASSWORD'),
	});

export type SmtpSchema = z.infer<ReturnType<typeof buildSmtpSchema>>;

export const parseSmtpEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): SmtpSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildSmtpSchema(resolvedNodeEnv).parse(source);
};
