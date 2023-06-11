import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError, z } from 'zod';

const deleteDrinkSchema = z.object({
	id: z.string({ required_error: 'Drink id is required' }).length(24, { message: 'Drink does not exist.' })
});
type IDeleteDrink = z.infer<typeof deleteDrinkSchema>;

@injectable()
class DeleteDrinkService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository
	) {}
	async execute(data: IDeleteDrink): Promise<void> {
		const result = deleteDrinkSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IDeleteDrink>;
			throw new AppError(error.issues[0].message);
		}
		const { id } = result.data;

		const drinkExists = await this.drinksRepository.findById(id);

		if (!drinkExists) {
			throw new AppError('Drink does not exist');
		}

		await this.drinksRepository.delete(id);
	}
}

export { DeleteDrinkService };
