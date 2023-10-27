import { IDeleteDrink } from '@modules/drinks/dtos/drink.dtos';
import { resolveDeleteDrinkService } from './deleteDrink.container';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class DeleteDrinkController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id }: IDeleteDrink = request.body;

		const service = resolveDeleteDrinkService();

		await service.execute({ id });

		return response.status(204).send();
	}
}

export { DeleteDrinkController };
