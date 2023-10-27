import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { resolveGetDrinkService } from './getDrink.container';

class GetDrinkController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id } = request.params;

		const service = resolveGetDrinkService();

		const drink = await service.execute({ id });

		return response.json(drink);
	}
}

export { GetDrinkController };
