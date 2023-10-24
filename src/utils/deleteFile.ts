import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import s3Config from '@config/s3';
import fileConfig from '@config/upload';
import { container } from 'tsyringe';
import { PinoLogger } from '@shared/container/providers/logger/implementations/PinoLogger.provider';

const logger = container.resolve(PinoLogger);

const s3 = new S3Client({
	region: s3Config.defaultRegion,
	credentials: {
		accessKeyId: s3Config.accessKeyId,
		secretAccessKey: s3Config.accessKey
	}
});

export const deleteFile = async (fileName: string): Promise<void> => {
	// fileConfig.storageType === 'local'
	if (fileConfig.storageType === 'local') {
		fileName = `./tmp/drink/${fileName}`;
		try {
			await fs.promises.stat(fileName);
		} catch {
			return;
		}

		await fs.promises.unlink(fileName);
		return;
	}
	// fileConfig.storageType === 's3'
	const command = new DeleteObjectCommand({
		Bucket: process.env.AWS_S3_BUCKET_NAME,
		Key: fileName
	});

	try {
		await s3.send(command);
	} catch (error) {
		logger.error(error, 'delete file error');
		return;
	}
};
