import { EnvType } from '@/env/env.types';

export const buildConnectionStringFromEnv = ({
	MONGO_PROTOCOL,
	MONGO_USERNAME,
	MONGO_PASSWORD,
	MONGO_HOST,
	MONGO_PORT,
	MONGO_DATABASE,
	MONGO_PARAMS,
}: EnvType): string => {
	if (!MONGO_PROTOCOL || !MONGO_USERNAME || !MONGO_PASSWORD || !MONGO_HOST || !MONGO_PORT || !MONGO_DATABASE) {
		throw new Error(
			'Missing connection options. Ensure MONGO_PROTOCOL, MONGO_USERNAME, MONGO_PASSWORD MONGO_HOST, MONGO_PORT and !MONGO_DATABASE are set.',
		);
	}

	const protocol = MONGO_PROTOCOL;
	const credentials = `${MONGO_USERNAME}:${MONGO_PASSWORD}`;
	const address = `${MONGO_HOST}:${MONGO_PORT}`;
	const database = MONGO_DATABASE;
	const params = MONGO_PARAMS;

	return `${protocol}://${credentials}@${address}/${database}?${params}`;
};
