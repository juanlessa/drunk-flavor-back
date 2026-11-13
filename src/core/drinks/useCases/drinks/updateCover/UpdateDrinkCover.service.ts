import { assertCanChangeDrink } from '@/core/drinks/helpers/catalogAuthorization.helpers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';
import { UpdateDrinkCoverCommand } from './updateDrinkCover.dtos';
import { generateStoredFileName, isSupportedFileType } from '@/shared/helpers/file.helpers';

export class UpdateDrinkCoverService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ drinkId, fileStream, mimetype, actor }: UpdateDrinkCoverCommand): Promise<void> {
		if (!isSupportedFileType('image', mimetype)) {
			throw new BadRequestError('apiResponses.drinks.invalidFileType', {
				path: 'UpdateDrinkCover.service.1',
				cause: 'invalid email',
			});
		}

		const drink = await this.drinksRepository.findById(drinkId);
		if (!drink) {
			throw new NotFoundError('apiResponses.drinks.notFound', { path: 'UpdateDrinkCover.service.2' });
		}
		assertCanChangeDrink('update', drink, actor, 'UpdateDrinkCover.service.forbidden');

		if (drink.cover) {
			await this.storageProvider.deleteFile(drink.cover.name);
		}

		const name = generateStoredFileName(drinkId, 'cover', mimetype);
		const url = '';

		await this.storageProvider.uploadFile({ fileStream, name, mimetype });
		await this.drinksRepository.update({ id: drinkId, updatedBy: actor.id, cover: { name, mimetype, url } });
	}
}
