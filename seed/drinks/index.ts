import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { logger } from '@/shared/providers/logger';
import { insertCategories } from './categories';
import { insertUnits } from './units';
import { insertIngredients } from './ingredients';
import { insertDrinks } from './drinks';
import { findSeedActor } from './owner';

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
	const actor = await findSeedActor();
	await insertCategories(actor);
	await insertUnits(actor);
	await insertIngredients(actor);
	await insertDrinks(actor);
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
