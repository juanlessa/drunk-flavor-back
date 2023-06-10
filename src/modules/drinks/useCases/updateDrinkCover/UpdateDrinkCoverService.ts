import { inject, injectable } from 'tsyringe';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { deleteFile } from '@utils/file';
import AppError from '@shared/errors/AppError';
import { SafeParseError, z } from 'zod';

const requestSchema = z.object({
	drinkId: z.string().length(24, { message: 'Drink does not exist!' }),
	coverFile: z.string().min(1, { message: 'cover file must have a name' })
});

type IRequest = z.infer<typeof requestSchema>;

@injectable()
class UpdateDrinkCoverService {
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
		const { drinkId, coverFile } = result.data;

		const drink = await this.drinksRepository.findById(drinkId);
		if (!drink) {
			throw new AppError('Drink does not exit');
		}

		if (drink.cover) {
			await deleteFile(drink.cover);
		}
		drink.cover = coverFile;

		await this.drinksRepository.update(drink);
	}
}

export { UpdateDrinkCoverService };
