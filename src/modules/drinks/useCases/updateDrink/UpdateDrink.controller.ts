import { IUpdateDrinkRequest } from '@modules/drinks/dtos/drink.dtos';
import { AppRequest, AppResponse } from '@shared/infra/http/types';
import { resolveUpdateDrinkService } from './updateDrink.container';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

class UpdateDrinkController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id, translations, ingredients }: IUpdateDrinkRequest = request.body;

		const service = resolveUpdateDrinkService();

		await service.execute({ id, translations, ingredients });

		return response.status(HTTP_STATUS.no_content).send();
	}
}

export { UpdateDrinkController };
