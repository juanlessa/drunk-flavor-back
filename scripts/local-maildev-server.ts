import { MailDev, type Servers } from 'maildev';

export const DEFAULT_LOCAL_SMTP_HOST = '127.0.0.1';
export const DEFAULT_LOCAL_SMTP_PORT = 1_025;
export const DEFAULT_LOCAL_MAILDEV_WEB_PORT = 1_080;

const DEFAULT_MAX_EMAILS = 100;

export type LocalMailDevServer = {
	maildev: MailDev;
	servers: Servers;
	host: string;
	smtpPort: number;
	webPort: number;
	smtpUrl: string;
	webUrl: string;
	apiUrl: string;
	close: () => Promise<void>;
};

type LocalMailDevServerOptions = {
	host?: string;
	smtpPort?: number;
	webPort?: number;
};

export const startLocalMailDevServer = async ({
	host = DEFAULT_LOCAL_SMTP_HOST,
	smtpPort = DEFAULT_LOCAL_SMTP_PORT,
	webPort = DEFAULT_LOCAL_MAILDEV_WEB_PORT,
}: LocalMailDevServerOptions = {}): Promise<LocalMailDevServer> => {
	const maildev = new MailDev({
		smtp: smtpPort,
		web: webPort,
		ip: host,
		webIp: host,
		hideExtensions: ['STARTTLS'],
		maxEmails: DEFAULT_MAX_EMAILS,
		silent: true,
	});
	const servers = await maildev.start();

	const smtpAddress = servers.smtp.getAddress();
	const webAddress = servers.api?.getAddress();

	if (!webAddress) {
		await maildev.stop();
		throw new Error('Unable to determine the local MailDev web address.');
	}

	const smtpUrl = `smtp://${host}:${smtpAddress.port}`;
	const webUrl = `http://${host}:${webAddress.port}`;

	let closePromise: Promise<void> | undefined;
	const close = (): Promise<void> => {
		closePromise ??= maildev.stop();
		return closePromise;
	};

	return {
		maildev,
		servers,
		host,
		smtpPort: smtpAddress.port,
		webPort: webAddress.port,
		smtpUrl,
		webUrl,
		apiUrl: `${webUrl}/api`,
		close,
	};
};
