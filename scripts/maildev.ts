import {
	DEFAULT_MAILDEV_HOST,
	DEFAULT_MAILDEV_SMTP_PORT,
	DEFAULT_MAILDEV_WEB_PORT,
	MailDevServer,
} from '@/infrastructure/maildev/MailDevServer';
import { logger } from '@/shared/providers/logger';

/**
 * Starts a local MailDev server for development (`npm run maildev`).
 *
 * It listens on fixed, predictable ports so the application can reach it through
 * `SMTP_HOST` / `SMTP_PORT` (or `SMTP_MODE=managed`). Override them with
 * `MAILDEV_HOST`, `MAILDEV_SMTP_PORT` and `MAILDEV_WEB_PORT`.
 */
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
	const maildev = new MailDevServer({
		host: process.env.MAILDEV_HOST?.trim() || DEFAULT_MAILDEV_HOST,
		smtpPort: readPort('MAILDEV_SMTP_PORT', DEFAULT_MAILDEV_SMTP_PORT),
		webPort: readPort('MAILDEV_WEB_PORT', DEFAULT_MAILDEV_WEB_PORT),
	});
	await maildev.start();

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

	maildev.onError((error) => rejectStop?.(error));

	logger.info(`Local MailDev SMTP server listening on ${maildev.smtpUrl}.`);
	logger.info(`MailDev inbox and API available at ${maildev.webUrl}.`);
	logger.info('Press Ctrl+C to stop.');

	try {
		await stopPromise;
	} finally {
		await maildev.stop();
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
