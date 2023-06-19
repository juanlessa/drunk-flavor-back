import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const s3 = new S3Client({
	region: process.env.AWS_DEFAULT_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
	}
});

export const deleteFile = async (fileName: string): Promise<void> => {
	// STORAGE_TYPE === 'local'
	if (process.env.STORAGE_TYPE === 'local') {
		fileName = `./tmp/drink/${fileName}`;
		try {
			await fs.promises.stat(fileName);
		} catch {
			return;
		}

		await fs.promises.unlink(fileName);
		return;
	}
	// STORAGE_TYPE === 's3'
	const command = new DeleteObjectCommand({
		Bucket: process.env.AWS_S3_BUCKET_NAME,
		Key: fileName
	});

	try {
		await s3.send(command);
	} catch (error) {
		console.error('delete file error');
		console.error(error);
		return;
	}
};
