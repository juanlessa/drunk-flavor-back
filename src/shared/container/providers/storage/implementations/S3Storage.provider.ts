import { IStorageProvider } from '../IStorage.provider';
import s3Config from '@config/s3';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import crypto from 'crypto';
import storageConfig from '@config/storage';
import { resolveLoggerProvider } from '../../logger';

const logger = resolveLoggerProvider();

export class S3StorageProvider implements IStorageProvider {
	private s3Client: S3Client;
	constructor() {
		this.s3Client = new S3Client({
			region: s3Config.defaultRegion,
			credentials: {
				accessKeyId: s3Config.accessKeyId,
				secretAccessKey: s3Config.accessKey
			}
		});
	}

	getFileURL(fileName: string): string {
		return `https://${s3Config.bucketName}.s3.${s3Config.defaultRegion}.amazonaws.com/${fileName}`;
	}
	async deleteFile(fileName: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: s3Config.bucketName,
			Key: fileName
		});

		try {
			await this.s3Client.send(command);
		} catch (error) {
			logger.error(error as Error, 'delete file error');
			return;
		}
	}

	configureUpload() {
		const storage = multerS3({
			s3: this.s3Client,
			bucket: s3Config.bucketName,
			contentType: multerS3.AUTO_CONTENT_TYPE,
			acl: 'public-read',
			key: (request, file, callback) => {
				const fileHash = crypto.randomBytes(16).toString('hex');
				const fileName = `${fileHash}-${file.originalname}`;
				return callback(null, fileName);
			}
		});

		return {
			storage,
			limits: {
				fieldSize: storageConfig.maxFileSize
			}
		};
	}
}
