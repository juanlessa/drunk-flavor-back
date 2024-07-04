import * as dotenv from 'dotenv';
dotenv.config();

const origin = 'localhost';
const originRgx = new RegExp(`${origin}`);
const originUrl = `https://${origin}`;

export default {
	credentials: true,
	methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
	cacheControl: 600,
	origin: [originUrl, originRgx]
};
