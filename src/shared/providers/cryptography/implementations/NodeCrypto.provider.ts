import { randomBytes } from 'node:crypto';
import { ICryptoProvider } from '../ICrypto.provider';
import { ServerError } from '@/shared/error/error.lib';
import { logger } from '@/shared/logger';

export class NodeCryptoProvider implements ICryptoProvider {
	async generateToken(length: number): Promise<string> {
		return new Promise((resolve, reject) => {
			randomBytes(length, (err, bytes) => {
				if (err) {
					logger.error(err, 'Error on randomBytes method from node:crypto');
					const error = new ServerError('Failed to generate token', {
						path: 'NodeCryptoProvider.generateToken',
						cause: err.message,
					});
					reject(error);
				} else {
					resolve(bytes.toString('hex'));
				}
			});
		});
	}
}
