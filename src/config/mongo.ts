import * as dotenv from 'dotenv';
dotenv.config();

export default {
	host: process.env.MONGO_HOST || 'localhost',
	port: process.env.MONGO_PORT || '27017',
	maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 25,
	database: process.env.MONGO_DATABASE || '',
	user: process.env.MONGO_USERNAME || '',
	password: process.env.MONGO_PASSWORD,
	params: '',
	serverSelectionTimeoutMS: 5000,
	connectTimeoutMS: 5000
};
