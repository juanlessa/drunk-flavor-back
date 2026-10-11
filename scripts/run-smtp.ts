import { logger } from '@/shared/providers/logger';
import {
	DEFAULT_LOCAL_MAILDEV_WEB_PORT,
	DEFAULT_LOCAL_SMTP_HOST,
	DEFAULT_LOCAL_SMTP_PORT,
	startLocalMailDevServer,
} from './local-maildev-server';

const TERMINATION_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;
type TerminationSignal = (typeof TERMINATION_SIGNALS)[number];

const readPort = (environmentKey: string, defaultPort: number): number => {
	const port = Number(process.env[environmentKey] ?? defaultPort);

	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new Error(`${environmentKey} must be an integer between 1 and 65535.`);
	}

	return port;
};

const main = async (): Promise<void> => {
	const host = process.env.LOCAL_SMTP_HOST?.trim() || DEFAULT_LOCAL_SMTP_HOST;
	const maildev = await startLocalMailDevServer({
		host,
		smtpPort: readPort('LOCAL_SMTP_PORT', DEFAULT_LOCAL_SMTP_PORT),
		webPort: readPort('LOCAL_MAILDEV_WEB_PORT', DEFAULT_LOCAL_MAILDEV_WEB_PORT),
	});
	let terminationSignal: TerminationSignal | undefined;
	let resolveStop: (() => void) | undefined;
	let rejectStop: ((error: Error) => void) | undefined;

	const stopPromise = new Promise<void>((resolve, reject) => {
		resolveStop = resolve;
		rejectStop = reject;
	});
	const signalHandlers = new Map<TerminationSignal, () => void>();
	const removeHandlers = (): void => {
		for (const [signal, handler] of signalHandlers) {
			process.off(signal, handler);
		}
	};

	for (const signal of TERMINATION_SIGNALS) {
		const handler = (): void => {
			terminationSignal ??= signal;
			resolveStop?.();
		};

		signalHandlers.set(signal, handler);
		process.once(signal, handler);
	}

	const handleServerError = (error: Error): void => rejectStop?.(error);
	maildev.servers.smtp.once('error', handleServerError);
	maildev.servers.api?.once('error', handleServerError);

	logger.info(`Local MailDev SMTP server listening on ${maildev.smtpUrl}.`);
	logger.info(`MailDev inbox and API available at ${maildev.webUrl}.`);
	logger.info('Press Ctrl+C to stop.');

	try {
		await stopPromise;
	} finally {
		await maildev.close();
		removeHandlers();
		logger.info('Local MailDev server has been closed.');
	}

	if (terminationSignal) {
		process.kill(process.pid, terminationSignal);
	}
};

try {
	await main();
} catch (error) {
	logger.error(error, 'Unable to run the local MailDev server.');
	process.exitCode = 1;
}
