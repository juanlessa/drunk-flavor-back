import mongoose, { Model } from 'mongoose';
import { logger } from '@/shared/logger';
import { env } from '@/env';
import { buildConnectionStringFromEnv } from './mongo.helpers';

export class MongoRepository {
	private connectionString: string;
	private static _instance: MongoRepository;

	private constructor() {
		this.connectionString = buildConnectionStringFromEnv(env);
	}

	static get Instance() {
		return this._instance || (this._instance = new this());
	}

	get client() {
		return mongoose.connection.getClient();
	}

	async start(url?: string) {
		if (!env.MONGO_MAX_POOL_SIZE || !env.MONGO_CONNECT_TIMEOUT_MS || !env.MONGO_SERVER_SELECTION_TIMEOUT_MS) {
			throw new Error(
				'Missing connection options. Ensure MONGO_MAX_POOL_SIZE, MONGO_CONNECT_TIMEOUT_MS, and MONGO_SERVER_SELECTION_TIMEOUT_MS are set.',
			);
		}
		if (url) {
			this.connectionString = url;
		}

		await mongoose.connect(this.connectionString, {
			maxPoolSize: env.MONGO_MAX_POOL_SIZE,
			serverSelectionTimeoutMS: env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
			connectTimeoutMS: env.MONGO_CONNECT_TIMEOUT_MS,
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
