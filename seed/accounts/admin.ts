import { z } from 'zod';
import { UserStatusEnum } from '@/core/accounts/entities/user.entity';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import {
	userEmailValidation,
	userNameValidation,
	userPasswordValidation,
	userSurnameValidation,
} from '@/core/accounts/schemas/user.schemas';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { RolesEnum } from '@/shared/accessControl/roles';
import { logger } from '@/shared/logger';
import { resolveHashProvider } from '@/shared/providers/cryptography';

process.on('unhandledRejection', (err) => {
	logger.error('Unhandled Rejection:', err);
	process.exit(1);
});

const initializeDatabase = async () => {
	await MongoRepository.Instance.start();
	process.send?.('ready');
};

const closeDatabase = async () => {
	try {
		await MongoRepository.Instance.stop();
	} catch (error) {
		logger.error('Error during close connection:', error);
		process.exit(1);
	}
};

const gracefulShutdown = (signal: string) => async () => {
	logger.info(`Received ${signal}. Closing script...`);
	try {
		await MongoRepository.Instance.stop();
	} catch (error) {
		logger.error('Error during shutdown:', error);
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

	const adminUserData = {
		name: ADMIN_NAME,
		surname: ADMIN_SURNAME,
		email: ADMIN_EMAIL,
		password: await hashProvider.hash(ADMIN_PASSWORD),
		role: RolesEnum['admin'],
		status: UserStatusEnum['active'],
	};

	try {
		await UserModel.create(adminUserData);
		logger.info('Admin created successfully');
	} catch (error) {
		logger.error('Error creating admin user:', error);
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
