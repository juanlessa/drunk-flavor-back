import s3Config from '@config/s3';
import fileConfig from '@config/upload';
import apiConfig from '@config/api';

export const getFileURL = (fileName: string): string => {
	if (fileConfig.storageType === 'local') {
		// fileConfig.storageType === 'local'
		fileName = `${apiConfig.host}:${apiConfig.port}/files/${fileName}`;
	} else {
		// fileConfig.storageType === 's3'
		fileName = `https://${s3Config.bucketName}.s3.${s3Config.defaultRegion}.amazonaws.com/${fileName}`;
	}
	return fileName;
};
