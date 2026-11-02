import { afterEach, describe, expect, it } from 'vitest';
import { EPHEMERAL_PORT, MailDevServer } from '@/infrastructure/maildev/MailDevServer';
import { nodemailerTransporter } from '@/shared/providers/mailer/implementations/nodemailerTransporter.helper';

type CapturedEmail = { subject: string };

const listEmails = async (server: MailDevServer): Promise<CapturedEmail[]> => {
	const response = await fetch(`${server.apiUrl}/email`);
	return (await response.json()) as CapturedEmail[];
};

describe('MailDevServer (integration)', () => {
	const servers: MailDevServer[] = [];

	const createServer = (options: ConstructorParameters<typeof MailDevServer>[0] = {}): MailDevServer => {
		const server = new MailDevServer({ smtpPort: EPHEMERAL_PORT, webPort: EPHEMERAL_PORT, ...options });
		servers.push(server);
		return server;
	};

	afterEach(async () => {
		await Promise.all(servers.splice(0).map((server) => server.stop()));
	});

	it('resolves ephemeral ports to the real ones after start', async () => {
		const server = createServer();

		await server.start();

		expect(server.isRunning).toBe(true);
		expect(server.smtp.port).toBeGreaterThan(0);
		expect(server.smtp.host).toBe('127.0.0.1');
		expect(server.smtpUrl).toBe(`smtp://127.0.0.1:${server.smtp.port}`);
		expect(server.apiUrl).toBe(`${server.webUrl}/api`);
	});

	it('gives each instance its own ports', async () => {
		const first = createServer();
		const second = createServer();

		await Promise.all([first.start(), second.start()]);

		expect(first.smtp.port).not.toBe(second.smtp.port);
		expect(first.webUrl).not.toBe(second.webUrl);
	});

	it('captures mail sent through a transporter built from its connection', async () => {
		const server = createServer();
		await server.start();
		const transporter = nodemailerTransporter(server.smtp);

		try {
			await transporter.sendMail({
				from: 'no-reply@drunkflavor.com',
				to: 'user@drunkflavor.com',
				subject: 'MailDevServer integration',
				html: '<p>hello</p>',
			});
		} finally {
			transporter.close();
		}

		const emails = await listEmails(server);
		expect(emails.map((email) => email.subject)).toContain('MailDevServer integration');
	});

	it('treats start and stop as idempotent', async () => {
		const server = createServer();

		await Promise.all([server.start(), server.start()]);
		const { port } = server.smtp;
		await server.start();
		expect(server.smtp.port).toBe(port);

		await Promise.all([server.stop(), server.stop()]);
		await server.stop();
		expect(server.isRunning).toBe(false);
	});

	it('can be started again after being stopped', async () => {
		const server = createServer();
		await server.start();
		await server.stop();

		await server.start();

		expect(server.isRunning).toBe(true);
		expect((await fetch(`${server.apiUrl}/email`)).ok).toBe(true);
	});

	it('releases its ports when stopped', async () => {
		const server = createServer();
		await server.start();
		const url = server.apiUrl;

		await server.stop();

		await expect(fetch(`${url}/email`)).rejects.toThrow();
	});

	it('rejects starting on a port that is already in use', async () => {
		const first = createServer();
		await first.start();
		const second = createServer({ smtpPort: first.smtp.port });

		await expect(second.start()).rejects.toThrow();
		expect(second.isRunning).toBe(false);
	});

	it('throws when connection details are read before start', () => {
		const server = createServer();

		expect(() => server.smtp).toThrow('MailDev is not running');
		expect(() => server.apiUrl).toThrow('MailDev is not running');
	});

	it.each([465, 587])('refuses to listen on the TLS-enforced SMTP port %i', (port) => {
		expect(() => new MailDevServer({ smtpPort: port })).toThrow(`port ${port}`);
	});
});
