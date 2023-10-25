import { IUpdateDrinkCover } from '@modules/drinks/dtos/drink.dtos';
import { DRINK_ERRORS } from '@modules/drinks/errors/drink.errors';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinks.repository';
import { IStorageProvider } from '@shared/container/providers/storage/IStorage.provider';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';

@injectable()
class UpdateDrinkCoverService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository,
		@inject('StorageProvider')
		private storageProvider: IStorageProvider
	) {}
	async execute({ drink_id, cover_file }: IUpdateDrinkCover): Promise<void> {
		const drink = await this.drinksRepository.findById(drink_id);
		if (!drink) {
			throw new AppError(DRINK_ERRORS.not_exist);
		}

		if (drink.cover) {
			await this.storageProvider.deleteFile(drink.cover);
		}
		drink.cover = cover_file;

		await this.drinksRepository.update({ id: drink_id, cover: drink.cover });
	}
}

export { UpdateDrinkCoverService };
