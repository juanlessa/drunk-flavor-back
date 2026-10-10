import mongoose, { Model } from 'mongoose';
import { logger } from '@/shared/providers/logger';
import { buildConnectionOptionsFromEnv, buildConnectionStringFromEnv } from './helpers/mongoose.helpers';

export class MongoConnection {
	private static _instance: MongoConnection;

	private connectionListenersRegistered = false;

	/**
	 * Set while `stop()` is intentionally closing the connection, so the
	 * `disconnected` listener does not log an unexpected-loss warning for a
	 * deliberate shutdown (e.g. test teardown).
	 */
	private isClosing = false;

	static get Instance() {
		return this._instance || (this._instance = new this());
	}

	get client() {
		return mongoose.connection.getClient();
	}

	/**
	 * Registers connection lifecycle listeners once. Mongoose does not
	 * necessarily emit 'error' when it loses connectivity, so 'disconnected' is
	 * listened to as well. Errors after the initial connection are retried by
	 * Mongoose, which emits 'error' for them.
	 */
	private registerConnectionListeners() {
		if (this.connectionListenersRegistered) {
			return;
		}

		mongoose.connection.on('error', (error) => logger.error(error, 'Mongo connection error.'));
		mongoose.connection.on('disconnected', () => {
			if (this.isClosing) {
				return;
			}
			logger.warn('Mongo connection has been lost.');
		});
		mongoose.connection.on('reconnected', () => logger.info('Mongo connection has been reestablished.'));

		this.connectionListenersRegistered = true;
	}

	async start(connectionString?: string) {
		// readyState 1 = connected, 2 = connecting; avoid opening a second connection.
		if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
			return;
		}

		mongoose.set('transactionAsyncLocalStorage', true);
		this.registerConnectionListeners();

		if (!connectionString) {
			connectionString = buildConnectionStringFromEnv();
		}

		const { maxPoolSize, serverSelectionTimeoutMS, connectTimeoutMS } = buildConnectionOptionsFromEnv();

		await mongoose.connect(connectionString, {
			maxPoolSize,
			serverSelectionTimeoutMS,
			connectTimeoutMS,
			autoCreate: true,
		});
		logger.info('Mongo connection has been stablish.');
	}

	async stop() {
		// readyState 0 = disconnected; nothing to close.
		if (mongoose.connection.readyState === 0) {
			return;
		}

		this.isClosing = true;
		try {
			await mongoose.connection.close();
		} finally {
			this.isClosing = false;
		}
		logger.info('Mongo connection has been closed.');
	}

	async dropAllCollections() {
		if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
			throw new Error('Mongoose is not connected to the database');
		}
		const collections = await mongoose.connection.db.collections();
		const dropPromises = collections.map(async (collection) => {
			try {
				await collection.drop();
			} catch (error) {
				if (error instanceof Error && error.message !== 'ns not found') {
					logger.error(`Failed to drop collection ${collection.collectionName}:`, error);
				}
			}
		});
		await Promise.all(dropPromises);
	}

	async dropCollection(model: Model<any>) {
		await model.collection.drop();
	}

	async emptyCollection(model: Model<any>) {
		await model.deleteMany({});
	}
}
