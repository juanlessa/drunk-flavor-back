import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { DeleteDrinkService } from './DeleteDrink.service';
import { IDeleteDrink } from '@modules/drinks/dtos/drink.dtos';

class DeleteDrinkController {
	async handle(request: Request, response: Response): Promise<Response> {
		const { id }: IDeleteDrink = request.body;

		const deleteDrinkService = container.resolve(DeleteDrinkService);

		await deleteDrinkService.execute({ id });

		return response.status(204).send();
	}
}

export { DeleteDrinkController };
