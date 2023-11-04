import mongoose, { Model } from 'mongoose';
import mongoConfig from '@config/mongo';
import { resolveLoggerProvider } from '@shared/container/providers/logger';

const logger = resolveLoggerProvider();

export class MongoRepository {
	private connectionString: string;
	private static _instance: MongoRepository;

	private constructor() {
		const mongoCredentials = `${mongoConfig.user}:${mongoConfig.password}`;
		const mongoAddress = `${mongoConfig.host}:${mongoConfig.port}`;
		const mongoDatabase = mongoConfig.database;
		const mongoParams = mongoConfig.params;
		this.connectionString = `mongodb://${mongoCredentials}@${mongoAddress}/${mongoDatabase}?${mongoParams}`;
	}

	static get Instance() {
		return this._instance || (this._instance = new this());
	}

	get client() {
		return mongoose.connection.getClient();
	}

	async start() {
		await mongoose.connect(this.connectionString, {
			maxPoolSize: mongoConfig.maxPoolSize,
			serverSelectionTimeoutMS: mongoConfig.serverSelectionTimeoutMS,
			connectTimeoutMS: mongoConfig.connectTimeoutMS,
			autoCreate: true
		});
		logger.info('Mongo connection has been stablish');
	}

	async stop() {
		await mongoose.connection.close();
		logger.info('Mongo connection has been closed');
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
