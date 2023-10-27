import { ICreateDrinkRequest } from '@modules/drinks/dtos/drink.dtos';
import { resolveCreateDrinkService } from '@modules/drinks/useCases/createDrink/createDrink.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class CreateDrinkController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { translations, ingredients }: ICreateDrinkRequest = request.body;

		const service = resolveCreateDrinkService();

		const drinkId = await service.execute({ translations, ingredients });

		return response.status(201).json(drinkId);
	}
}

export { CreateDrinkController };
