import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { BadRequestError } from '@/shared/error/error.lib';
import { DRINK_MESSAGES } from '@/core/drinks/constants/drinks.constants';
import { UpdateDrinkCoverDTO } from './updateDrinkCover.dtos';
import { FileMetadata } from '@/shared/types/file.types';
import { generateHashedName, isImageFile } from '@/shared/helpers/file.helpers';

export class UpdateDrinkCoverService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ drinkId, fileStream, name, mimetype }: UpdateDrinkCoverDTO): Promise<void> {
		if (!isImageFile(mimetype)) {
			throw new BadRequestError('invalid file type', {
				path: 'UpdateDrinkCover.service.1',
				cause: 'invalid email',
			});
		}

		const drink = await this.drinksRepository.findById(drinkId);
		if (!drink) {
			throw new BadRequestError(DRINK_MESSAGES.notExist.message, { path: 'UpdateDrinkCover.service.2' });
		}

		if (drink.cover) {
			await this.storageProvider.deleteFile(drink.cover.name);
		}

		name = generateHashedName(name);

		await this.storageProvider.uploadFile({ fileStream, name, mimetype });
		await this.drinksRepository.update({ id: drinkId, cover: { name, mimetype } });
	}
}
