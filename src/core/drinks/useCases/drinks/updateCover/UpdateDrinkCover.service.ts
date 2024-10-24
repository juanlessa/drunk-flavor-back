import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { BadRequestError } from '@/shared/error/error.lib';
import { UpdateDrinkCoverDTO } from './updateDrinkCover.dtos';
import {
	generateHashedName,
	hasFileExtension,
	isSupportedFileType,
	setFileExtension,
} from '@/shared/helpers/file.helpers';

export class UpdateDrinkCoverService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ drinkId, fileStream, name, mimetype }: UpdateDrinkCoverDTO): Promise<void> {
		if (!isSupportedFileType('image', mimetype)) {
			throw new BadRequestError('apiResponses.drinks.invalidFileType', {
				path: 'UpdateDrinkCover.service.1',
				cause: 'invalid email',
			});
		}

		const drink = await this.drinksRepository.findById(drinkId);
		if (!drink) {
			throw new BadRequestError('apiResponses.drinks.notExist', { path: 'UpdateDrinkCover.service.2' });
		}

		if (drink.cover) {
			await this.storageProvider.deleteFile(drink.cover.name);
		}

		if (!hasFileExtension(name, mimetype)) {
			name = setFileExtension(name, mimetype);
		}
		name = generateHashedName(name);
		const url = '';

		await this.storageProvider.uploadFile({ fileStream, name, mimetype });
		await this.drinksRepository.update({ id: drinkId, cover: { name, mimetype, url } });
	}
}
