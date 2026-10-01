import type { Environment } from 'vitest/runtime';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { env } from '@/env';

let mongod: MongoMemoryReplSet | undefined = undefined;
let connectionString: string | undefined = undefined;

export default <Environment>{
	name: 'mongo',
	viteEnvironment: 'ssr',

	async setup() {
		if (env.MONGO_PERSISTENCE_MODE === 'inMemory') {
			mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
			connectionString = mongod.getUri();
		}

		await MongoConnection.Instance.start(connectionString);

		return {
			async teardown() {
				if (env.MONGO_PERSISTENCE_MODE === 'inDisk') {
					await MongoConnection.Instance.dropAllCollections();
				}

				await MongoConnection.Instance.stop();

				if (env.MONGO_PERSISTENCE_MODE === 'inMemory' && mongod) {
					await mongod.stop();
				}
			},
		};
	},
};
