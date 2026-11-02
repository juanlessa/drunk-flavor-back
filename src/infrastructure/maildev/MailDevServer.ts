import { MailDev, type Servers } from 'maildev';
import type { SmtpConnection } from '@/env/smtp';

export const DEFAULT_MAILDEV_HOST = '127.0.0.1';
export const DEFAULT_MAILDEV_SMTP_PORT = 1_025;
export const DEFAULT_MAILDEV_WEB_PORT = 1_080;

/** Asks the operating system for any free port. Use it where collisions must be avoided (tests). */
export const EPHEMERAL_PORT = 0;

const DEFAULT_MAX_EMAILS = 100;

/**
 * Ports on which the mailer enforces TLS (see `nodemailerTransporter.helper.ts`).
 * MailDev does not offer TLS here, so it must not be pinned to them.
 */
const TLS_SMTP_PORTS: readonly number[] = [465, 587];

export type MailDevServerOptions = {
	host?: string;
	smtpPort?: number;
	webPort?: number;
	maxEmails?: number;
};

type RunningState = {
	maildev: MailDev;
	servers: Servers;
	smtpPort: number;
	webPort: number;
};

/**
 * Lifecycle wrapper around a local MailDev instance (SMTP server + inbox web UI).
 *
 * It is a development and test tool: never import it from the server or worker
 * entry points (`maildev` is a devDependency). Pass `EPHEMERAL_PORT` for the
 * ports to let the operating system pick free ones, then read the real values
 * from `smtp`, `webUrl` and `apiUrl` after `start()`.
 */
export class MailDevServer {
	private readonly host: string;
	private readonly requestedSmtpPort: number;
	private readonly requestedWebPort: number;
	private readonly maxEmails: number;

	private state: RunningState | undefined;
	private starting: Promise<void> | undefined;
	private stopping: Promise<void> | undefined;

	constructor({
		host = DEFAULT_MAILDEV_HOST,
		smtpPort = DEFAULT_MAILDEV_SMTP_PORT,
		webPort = DEFAULT_MAILDEV_WEB_PORT,
		maxEmails = DEFAULT_MAX_EMAILS,
	}: MailDevServerOptions = {}) {
		if (TLS_SMTP_PORTS.includes(smtpPort)) {
			throw new Error(
				`MailDev cannot listen on SMTP port ${smtpPort}: the mailer enforces TLS on ports ${TLS_SMTP_PORTS.join(' and ')}.`,
			);
		}

		this.host = host;
		this.requestedSmtpPort = smtpPort;
		this.requestedWebPort = webPort;
		this.maxEmails = maxEmails;
	}

	get isRunning(): boolean {
		return this.state !== undefined;
	}

	/** SMTP connection to hand to a transporter. MailDev accepts any client without authentication. */
	get smtp(): SmtpConnection {
		const { smtpPort } = this.requireState();
		return { host: this.host, port: smtpPort, username: '', password: '' };
	}

	get smtpUrl(): string {
		return `smtp://${this.host}:${this.requireState().smtpPort}`;
	}

	get webUrl(): string {
		return `http://${this.host}:${this.requireState().webPort}`;
	}

	/** Base URL of MailDev's REST API (for example `GET {apiUrl}/email`). */
	get apiUrl(): string {
		return `${this.webUrl}/api`;
	}

	/** Starts the servers. Safe to call more than once. */
	async start(): Promise<void> {
		if (this.stopping) {
			await this.stopping;
		}

		if (this.state) {
			return;
		}

		this.starting ??= this.launch().finally(() => {
			this.starting = undefined;
		});
		await this.starting;
	}

	/** Stops the servers and releases the ports. Safe to call more than once. */
	async stop(): Promise<void> {
		if (this.starting) {
			await this.starting.catch(() => undefined);
		}

		const state = this.state;
		if (!state) {
			return;
		}

		this.stopping ??= state.maildev.stop().finally(() => {
			this.state = undefined;
			this.stopping = undefined;
		});
		await this.stopping;
	}

	/** Registers a listener for runtime errors raised by the SMTP or API server. */
	onError(listener: (error: Error) => void): void {
		const { servers } = this.requireState();
		servers.smtp.once('error', listener);
		servers.api?.once('error', listener);
	}

	private async launch(): Promise<void> {
		const maildev = new MailDev({
			smtp: this.requestedSmtpPort,
			web: this.requestedWebPort,
			ip: this.host,
			webIp: this.host,
			hideExtensions: ['STARTTLS'],
			maxEmails: this.maxEmails,
			silent: true,
		});

		let servers: Servers;
		try {
			servers = await maildev.start();
		} catch (error) {
			await maildev.stop().catch(() => undefined);
			throw error;
		}

		const webAddress = servers.api?.getAddress();
		if (!webAddress) {
			await maildev.stop();
			throw new Error('Unable to determine the MailDev web address.');
		}

		this.state = {
			maildev,
			servers,
			smtpPort: servers.smtp.getAddress().port,
			webPort: webAddress.port,
		};
	}

	private requireState(): RunningState {
		if (!this.state) {
			throw new Error('MailDev is not running. Call MailDevServer.start() first.');
		}
		return this.state;
	}
}
