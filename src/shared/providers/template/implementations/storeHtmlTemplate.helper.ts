import { getRootPath } from '@/shared/helpers/getRootPath.helper';
import { logger } from '@/shared/logger';
import fs from 'node:fs/promises';
import path from 'node:path';

export const storeHtmlTemplate = async (filename: string, htmlContent: string): Promise<void> => {
	if (!process.env.STORE_TEMPLATES) {
		return;
	}

	const rootPath = getRootPath();
	const templatesDir = path.join(rootPath, 'templates');

	await fs.mkdir(templatesDir, { recursive: true });

	const filePath = path.join(templatesDir, `${filename}.html`);

	try {
		await fs.writeFile(filePath, htmlContent, 'utf8');
	} catch (error) {
		logger.error(`Failed to save HTML file: ${(error as Error).message}`);
		throw error;
	}
};
