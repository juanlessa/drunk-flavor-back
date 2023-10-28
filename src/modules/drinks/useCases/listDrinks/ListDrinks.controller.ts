import { resolveListDrinksService } from '@modules/drinks/useCases/listDrinks/listDrinks.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class ListDrinksController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const service = resolveListDrinksService();

		const drinks = await service.execute();

		return response.json(drinks);
	}
}

export { ListDrinksController };
