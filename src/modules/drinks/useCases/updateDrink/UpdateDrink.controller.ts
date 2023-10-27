import { IUpdateDrinkRequest } from '@modules/drinks/dtos/drink.dtos';
import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { resolveUpdateDrinkService } from './updateDrink.container';

class UpdateDrinkController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id, translations, ingredients }: IUpdateDrinkRequest = request.body;

		const service = resolveUpdateDrinkService();

		await service.execute({ id, translations, ingredients });

		return response.status(204).send();
	}
}

export { UpdateDrinkController };
