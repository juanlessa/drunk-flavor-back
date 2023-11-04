import { ICreateDrinkRequest } from '@modules/drinks/dtos/drink.dtos';
import { resolveCreateDrinkService } from '@modules/drinks/useCases/createDrink/createDrink.container';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class CreateDrinkController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { translations, ingredients }: ICreateDrinkRequest = request.body;

		const service = resolveCreateDrinkService();

		const drinkId = await service.execute({ translations, ingredients });

		return response.status(HTTP_STATUS.created).json(drinkId);
	}
}

export { CreateDrinkController };
