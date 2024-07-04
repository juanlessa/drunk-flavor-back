import * as dotenv from 'dotenv';
dotenv.config();

export default {
	storageType: process.env.STORAGE_TYPE || 'local',
	maxFileSize: 10 * 1024 * 1024, //10MB
};
