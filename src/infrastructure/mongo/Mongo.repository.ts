import mongoose, { Model } from 'mongoose';
import { logger } from '@/shared/logger';
import { buildConnectionOptionsFromEnv, buildConnectionStringFromEnv } from './helpers/mongoose.helpers';

export class MongoRepository {
	private static _instance: MongoRepository;

	static get Instance() {
		return this._instance || (this._instance = new this());
	}

	get client() {
		return mongoose.connection.getClient();
	}

	async start(connectionString?: string) {
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
		await mongoose.connection.close();
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
