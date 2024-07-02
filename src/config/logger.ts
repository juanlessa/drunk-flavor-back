import * as dotenv from 'dotenv';
dotenv.config();

export default {
	enabled: process.env.LOGGER_ENABLED !== 'false',
	level: process.env.LOGGER_LEVEL || 'info'
};
