import * as dotenv from 'dotenv';
dotenv.config();

export default {
	port: Number(process.env.API_PORT) || 3333,
	host: process.env.API_HOST || 'http://localhost'
};
