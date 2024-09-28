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
		const collections = await mongoose.connection.db.collections();
		for (let collection of collections) {
			await collection.drop();
		}
	}

	async dropCollection(model: Model<any>) {
		await model.collection.drop();
	}

	async emptyCollection(model: Model<any>) {
		await model.deleteMany({});
	}
}
