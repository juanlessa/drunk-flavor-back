import { z } from 'zod/v4';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { UserOwnerAlreadyExistsError } from '@/core/accounts/errors/user.errors';
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
	const usersRepository = resolveUsersRepository();
	const existingOwner = await usersRepository.findByRole(Roles.owner);
	if (existingOwner) {
		logger.info('Owner already exists; skipping bootstrap');
		return;
	}

	const ownerSchema = z.object({
		OWNER_NAME: userNameValidation,
		OWNER_SURNAME: userSurnameValidation,
		OWNER_EMAIL: userEmailValidation,
		OWNER_PASSWORD: userPasswordValidation,
	});

	const { OWNER_NAME, OWNER_SURNAME, OWNER_EMAIL, OWNER_PASSWORD } = ownerSchema.parse(process.env);
	const hashProvider = resolveHashProvider();
	const credentialsRepository = resolveCredentialsRepository();
	const transactionManager = resolveTransactionManager();
	const passwordHash = await hashProvider.hash(OWNER_PASSWORD);

	try {
		await transactionManager.withTransaction(async () => {
			const createdUser = await usersRepository.create({
				name: OWNER_NAME,
				surname: OWNER_SURNAME,
				email: OWNER_EMAIL,
				emailVerified: true,
				role: Roles.owner,
				status: UserStatuses.active,
			});

			await credentialsRepository.create({
				userId: createdUser.id,
				passwordHash,
			});
		});
		logger.info('Owner created successfully');
	} catch (error) {
		if (error instanceof UserOwnerAlreadyExistsError) {
			logger.info('Owner already exists; skipping bootstrap');
			return;
		}
		logger.error({ err: error }, 'Error creating owner user');
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
