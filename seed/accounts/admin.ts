import { z } from 'zod/v4';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import {
	userEmailValidation,
	userNameValidation,
	userPasswordValidation,
	userSurnameValidation,
} from '@/core/accounts/schemas/user.schemas';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { logger } from '@/shared/providers/logger';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import { resolveUsersRepository, resolveCredentialsRepository } from '@/core/accounts/infra/mongo/container';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';

process.on('unhandledRejection', (err) => {
	logger.error({ err }, 'Unhandled Rejection');
	process.exit(1);
});

const initializeDatabase = async () => {
	await MongoConnection.Instance.start();
	process.send?.('ready');
};

const closeDatabase = async () => {
	try {
		await MongoConnection.Instance.stop();
	} catch (error) {
		logger.error({ err: error }, 'Error during close connection');
		process.exit(1);
	}
};

const gracefulShutdown = (signal: string) => async () => {
	logger.info(`Received ${signal}. Closing script...`);
	try {
		await MongoConnection.Instance.stop();
	} catch (error) {
		logger.error({ err: error }, 'Error during shutdown');
		process.exit(1);
	}
	process.exit(0);
};

const seedDatabase = async () => {
	const adminSchema = z.object({
		ADMIN_NAME: userNameValidation,
		ADMIN_SURNAME: userSurnameValidation,
		ADMIN_EMAIL: userEmailValidation,
		ADMIN_PASSWORD: userPasswordValidation,
	});

	const { ADMIN_NAME, ADMIN_SURNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = adminSchema.parse(process.env);

	const hashProvider = resolveHashProvider();
	const usersRepository = resolveUsersRepository();
	const credentialsRepository = resolveCredentialsRepository();
	const transactionManager = resolveTransactionManager();

	const passwordHash = await hashProvider.hash(ADMIN_PASSWORD);

	try {
		await transactionManager.withTransaction(async () => {
			const createdUser = await usersRepository.create({
				name: ADMIN_NAME,
				surname: ADMIN_SURNAME,
				email: ADMIN_EMAIL,
				emailVerified: true,
				role: Roles['admin'],
				status: UserStatuses['active'],
			});

			await credentialsRepository.create({
				userId: createdUser.id,
				passwordHash: passwordHash,
			});
		});
		logger.info('Admin created successfully');
	} catch (error) {
		logger.error({ err: error }, 'Error creating admin user');
		throw error;
	}
};

const main = async () => {
	await initializeDatabase();
	await seedDatabase();
	await closeDatabase();
};

main();

['SIGINT', 'SIGTERM'].forEach((signal) => {
	process.on(signal, gracefulShutdown(signal));
});
