import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { logger } from '@/shared/logger';
import { insertCategories } from './categories';
import { insertIngredients } from './ingredients';
import { insertDrinks } from './drinks';

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
	await insertCategories();
	await insertIngredients();
	await insertDrinks();
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
