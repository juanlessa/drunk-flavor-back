import { inject, injectable } from 'tsyringe';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { IDrinkResponse } from '@modules/drinks/dtos/DrinksDTO';
import AppError from '@shared/errors/AppError';
import { SafeParseError, z } from 'zod';
import { getFileURL } from '@utils/getFileURL';

const getDrinkSchema = z.object({
	id: z.string({ required_error: 'Drink id is required' }).length(24, { message: 'Drink does not exist.' })
});
type IGetDrink = z.infer<typeof getDrinkSchema>;

@injectable()
class GetDrinkService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository
	) {}

	async execute(data: IGetDrink): Promise<IDrinkResponse> {
		const result = getDrinkSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IGetDrink>;
			throw new AppError(error.issues[0].message);
		}
		const { id } = result.data;

		const drinks = await this.drinksRepository.findByIdWithIngredientsDetails(id);
		if (drinks.length !== 1) {
			throw new AppError('Drink not found!');
		}
		const drink = drinks[0];

		if (drink.cover) {
			drink.cover = getFileURL(drink.cover);
		}
		if (drink.thumbnail) {
			drink.thumbnail = getFileURL(drink.thumbnail);
		}

		return drink;
	}
}

export { GetDrinkService };
