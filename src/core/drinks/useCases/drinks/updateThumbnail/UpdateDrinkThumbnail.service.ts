import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { BadRequestError } from '@/shared/error/error.lib';
import { DRINK_MESSAGES } from '@/core/drinks/constants/drinks.constants';

import {
	generateHashedName,
	hasFileExtension,
	isSupportedFileType,
	setFileExtension,
} from '@/shared/helpers/file.helpers';
import { UpdateDrinkThumbnailDTO } from './updateDrinkThumbnail.dtos';

export class UpdateDrinkThumbnailService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ drinkId, fileStream, name, mimetype }: UpdateDrinkThumbnailDTO): Promise<void> {
		if (!isSupportedFileType('image', mimetype)) {
			throw new BadRequestError('invalid file type', {
				path: 'UpdateDrinkThumbnail.service.1',
				cause: 'invalid email',
			});
		}

		const drink = await this.drinksRepository.findById(drinkId);
		if (!drink) {
			throw new BadRequestError(DRINK_MESSAGES.notExist.message, { path: 'UpdateDrinkThumbnail.service.2' });
		}

		if (drink.thumbnail) {
			await this.storageProvider.deleteFile(drink.thumbnail.name);
		}

		if (!hasFileExtension(name, mimetype)) {
			name = setFileExtension(name, mimetype);
		}
		name = generateHashedName(name);
		const url = '';

		await this.storageProvider.uploadFile({ fileStream, name, mimetype });
		await this.drinksRepository.update({ id: drinkId, thumbnail: { name, mimetype, url } });
	}
}
