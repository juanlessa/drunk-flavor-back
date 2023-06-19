import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import AppError from '@shared/errors/AppError';
import { deleteFile } from '@utils/deleteFile';
import { inject, injectable } from 'tsyringe';
import { SafeParseError, z } from 'zod';

const requestSchema = z.object({
	drinkId: z.string().length(24, { message: 'Drink does not exist' }),
	thumbnailFile: z.string().min(1, { message: 'thumbnail file must have a name' })
});

type IRequest = z.infer<typeof requestSchema>;

@injectable()
class UpdateDrinkThumbnailService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository
	) {}
	async execute(data: IRequest): Promise<void> {
		const result = requestSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IRequest>;
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
