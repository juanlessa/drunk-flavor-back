import { spawn, type ChildProcess, type SpawnOptions } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import nodemailer from 'nodemailer';
import { parseSmtpEnv } from '@/env/smtp';
import { logger } from '@/shared/logger';
import { DEFAULT_LOCAL_SMTP_HOST, startLocalMailDevServer, type LocalMailDevServer } from './local-maildev-server';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SMTP_PROBE_ATTEMPTS = 3;
const SMTP_PROBE_RETRY_DELAY_MS = 500;
const SMTP_PROBE_TIMEOUT_MS = 3_000;
const FORWARDED_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;

type ForwardedSignal = (typeof FORWARDED_SIGNALS)[number];

type SmtpConfiguration = {
	host: string;
	port: number;
	username: string;
	password: string;
};

type TestProcessResult = {
	code: number | null;
	signal: NodeJS.Signals | null;
};

type Command = {
	executable: string;
	arguments: string[];
};

const delay = (milliseconds: number): Promise<void> =>
	new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

const loadE2eEnvironment = (): void => {
	process.env.NODE_ENV = 'e2e';

	const result = loadDotenv({
		path: resolve(PROJECT_ROOT, '.env.testing'),
		override: false,
		quiet: true,
	});
	const error = result.error as NodeJS.ErrnoException | undefined;

	if (error && error.code !== 'ENOENT') {
		throw new Error('Unable to load .env.testing.', { cause: error });
	}
};

const readSmtpConfiguration = (): SmtpConfiguration => {
	const smtp = parseSmtpEnv();

	if (!Number.isInteger(smtp.SMTP_PORT) || smtp.SMTP_PORT < 1 || smtp.SMTP_PORT > 65_535) {
		throw new Error('SMTP_PORT must be an integer between 1 and 65535.');
	}

	return {
		host: smtp.SMTP_HOST.trim(),
		port: smtp.SMTP_PORT,
		username: smtp.SMTP_USERNAME,
		password: smtp.SMTP_PASSWORD,
	};
};

const verifySmtpConnection = async (smtp: SmtpConfiguration): Promise<boolean> => {
	if (!smtp.host) {
		return false;
	}

	for (let attempt = 1; attempt <= SMTP_PROBE_ATTEMPTS; attempt += 1) {
		const auth =
			smtp.username && smtp.password
				? {
						user: smtp.username,
						pass: smtp.password,
					}
				: undefined;
		const transporter = nodemailer.createTransport({
			host: smtp.host,
			port: smtp.port,
			auth,
			connectionTimeout: SMTP_PROBE_TIMEOUT_MS,
			greetingTimeout: SMTP_PROBE_TIMEOUT_MS,
			socketTimeout: SMTP_PROBE_TIMEOUT_MS,
		});

		try {
			await transporter.verify();
			return true;
		} catch {
			if (attempt < SMTP_PROBE_ATTEMPTS) {
				await delay(SMTP_PROBE_RETRY_DELAY_MS);
			}
		} finally {
			transporter.close();
		}
	}

	return false;
};

const createTestCommand = (arguments_: string[]): Command => {
	const npmArguments = ['run', 'test:e2e:run', '--', ...arguments_];
	const npmExecPath = process.env.npm_execpath;

	if (npmExecPath) {
		return {
			executable: process.execPath,
			arguments: [npmExecPath, ...npmArguments],
		};
	}

	return {
		executable: process.platform === 'win32' ? 'npm.cmd' : 'npm',
		arguments: npmArguments,
	};
};

const runTests = (
	arguments_: string[],
	environment: NodeJS.ProcessEnv,
	onSpawn: (child: ChildProcess) => void,
): Promise<TestProcessResult> => {
	const command = createTestCommand(arguments_);
	const options: SpawnOptions = {
		cwd: PROJECT_ROOT,
		detached: process.platform !== 'win32',
		env: environment,
		stdio: 'inherit',
		shell: false,
	};
	const child = spawn(command.executable, command.arguments, options);
	onSpawn(child);

	return new Promise((resolveRun, rejectRun) => {
		child.once('error', rejectRun);
		child.once('close', (code, signal) => resolveRun({ code, signal }));
	});
};

const terminateChild = (child: ChildProcess | undefined, signal: ForwardedSignal): void => {
	if (!child || child.exitCode !== null || child.signalCode !== null) {
		return;
	}

	try {
		if (process.platform !== 'win32' && child.pid) {
			process.kill(-child.pid, signal);
		} else {
			child.kill(signal);
		}
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
			throw error;
		}
	}
};

const main = async (): Promise<void> => {
	loadE2eEnvironment();

	const smtp = readSmtpConfiguration();
	let fallback: LocalMailDevServer | undefined;
	let child: ChildProcess | undefined;
	let interruptedBy: ForwardedSignal | undefined;
	let fallbackFailed = false;
	let closePromise: Promise<void> | undefined;

	const closeFallbackOnce = (): Promise<void> => {
		closePromise ??= (fallback?.close() ?? Promise.resolve()).then(() => {
			if (fallback) {
				logger.info('Local MailDev fallback has been closed.');
			}
		});
		return closePromise;
	};

	const signalHandlers = new Map<ForwardedSignal, () => void>();
	const removeSignalHandlers = (): void => {
		for (const [signal, handler] of signalHandlers) {
			process.off(signal, handler);
		}
	};

	try {
		if (await verifySmtpConnection(smtp)) {
			logger.info('Using configured SMTP server.');
		} else {
			fallback = await startLocalMailDevServer({
				host: DEFAULT_LOCAL_SMTP_HOST,
				smtpPort: 0,
				webPort: 0,
			});
			process.env.SMTP_HOST = fallback.host;
			process.env.SMTP_PORT = String(fallback.smtpPort);
			process.env.SMTP_USERNAME = '';
			process.env.SMTP_PASSWORD = '';
			process.env.MAILDEV_API_URL = fallback.apiUrl;
			logger.info(`Configured SMTP server is unavailable; using MailDev at ${fallback.webUrl}.`);
		}

		for (const signal of FORWARDED_SIGNALS) {
			const handler = (): void => {
				interruptedBy ??= signal;
				terminateChild(child, signal);

				if (!child || child.exitCode !== null || child.signalCode !== null) {
					void closeFallbackOnce().finally(() => {
						removeSignalHandlers();
						process.kill(process.pid, signal);
					});
				}
			};

			signalHandlers.set(signal, handler);
			process.once(signal, handler);
		}

		if (fallback) {
			const handleFallbackError = (error: Error): void => {
				fallbackFailed = true;
				logger.error(error, 'Local MailDev fallback failed.');
				terminateChild(child, 'SIGTERM');
			};

			fallback.servers.smtp.once('error', handleFallbackError);
			fallback.servers.api?.once('error', handleFallbackError);
		}

		const result = await runTests(process.argv.slice(2), process.env, (spawnedChild) => {
			child = spawnedChild;
		});

		await closeFallbackOnce();
		removeSignalHandlers();

		if (fallbackFailed) {
			process.exitCode = 1;
			return;
		}

		const terminationSignal = interruptedBy ?? result.signal;
		if (terminationSignal) {
			process.kill(process.pid, terminationSignal);
			return;
		}

		process.exitCode = result.code ?? 1;
	} catch (error) {
		terminateChild(child, 'SIGTERM');
		await closeFallbackOnce();
		removeSignalHandlers();
		logger.error(error, 'Unable to run E2E tests.');
		process.exitCode = 1;
	}
};

await main();
