import { IStorageProvider } from '../IStorage.provider';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '@/env';
import { logger } from '@/shared/logger';
import { UploadFileOptions } from '../storage.dtos';

export class S3StorageProvider implements IStorageProvider {
	private s3Client: S3Client;
	private readonly BUCKET_NAME: string;
	private readonly DEFAULT_REGION: string;

	constructor() {
		const { AWS_DEFAULT_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME } = env;

		if (!AWS_ACCESS_KEY_ID || !AWS_DEFAULT_REGION || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
			throw new Error('invalid AWS credentials');
		}
		this.BUCKET_NAME = AWS_S3_BUCKET_NAME;
		this.DEFAULT_REGION = AWS_DEFAULT_REGION;

		this.s3Client = new S3Client({
			region: AWS_DEFAULT_REGION,
			credentials: {
				accessKeyId: AWS_ACCESS_KEY_ID,
				secretAccessKey: AWS_SECRET_ACCESS_KEY,
			},
		});
	}

	getFileURL(fileName: string): string {
		return `https://${this.BUCKET_NAME}.s3.${this.DEFAULT_REGION}.amazonaws.com/${fileName}`;
	}
	async deleteFile(fileName: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.BUCKET_NAME,
			Key: fileName,
		});

		try {
			await this.s3Client.send(command);
		} catch (error) {
			const err = error as Error;
			logger.error(err, 'delete file error');
			throw err;
		}
	}

	async uploadFile({ fileStream, mimetype, name }: UploadFileOptions) {
		const command = new PutObjectCommand({
			Bucket: this.BUCKET_NAME,
			Key: name,
			ContentType: mimetype,
			Body: fileStream,
		});

		try {
			await this.s3Client.send(command);
		} catch (error) {
			const err = error as Error;
			logger.error(err, 'upload file error');
			throw new Error('unable to upload file');
		}
	}
}
