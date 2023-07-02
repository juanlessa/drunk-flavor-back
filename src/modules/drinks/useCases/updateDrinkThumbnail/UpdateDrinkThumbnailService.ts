import { IUpdateDrinkThumbnail } from '@modules/drinks/dtos/Drinks';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { updateDrinkThumbnailSchema } from '@modules/drinks/validations/drinks';
import AppError from '@shared/errors/AppError';
import { deleteFile } from '@utils/deleteFile';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class UpdateDrinkThumbnailService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository
	) {}
	async execute(data: IUpdateDrinkThumbnail): Promise<void> {
		const result = updateDrinkThumbnailSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IUpdateDrinkThumbnail>;
			throw new AppError(error.issues[0].message);
		}
		const { drinkId, thumbnailFile } = result.data;

		const drink = await this.drinksRepository.findById(drinkId);
		if (!drink) {
			throw new AppError('Drink does not exit');
		}

		if (drink.thumbnail) {
			await deleteFile(drink.thumbnail);
		}
		drink.thumbnail = thumbnailFile;

		await this.drinksRepository.update(drink);
	}
}

export { UpdateDrinkThumbnailService };
