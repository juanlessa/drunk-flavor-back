import * as dotenv from 'dotenv';
dotenv.config();

export default {
	bucketName: process.env.AWS_S3_BUCKET_NAME || '',
	accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
	accessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
	defaultRegion: process.env.AWS_DEFAULT_REGION || ''
};
