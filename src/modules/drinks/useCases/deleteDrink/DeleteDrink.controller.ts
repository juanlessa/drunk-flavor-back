import { IDeleteDrink } from '@modules/drinks/dtos/drink.dtos';
import { resolveDeleteDrinkService } from '@modules/drinks/useCases/deleteDrink/deleteDrink.container';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { AppRequest, AppResponse } from '@shared/infra/http/types';

class DeleteDrinkController {
	async handle(request: AppRequest, response: AppResponse): Promise<AppResponse> {
		const { id }: IDeleteDrink = request.body;

		const service = resolveDeleteDrinkService();

		await service.execute({ id });

		return response.status(HTTP_STATUS.no_content).send();
	}
}

export { DeleteDrinkController };
