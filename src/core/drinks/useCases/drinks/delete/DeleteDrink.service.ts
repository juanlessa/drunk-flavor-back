import { assertCanChangeDrink } from '@/core/drinks/helpers/catalogAuthorization.helpers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { deleteDrinkEngagementJob, deleteStorageFileJob } from '@/shared/providers/queue/cleanup/cleanupJobs';
import { enqueueCleanupJobs } from '@/shared/providers/queue/cleanup/enqueueCleanupJobs.helpers';
import { ICleanupQueueProvider } from '@/shared/providers/queue/cleanup/ICleanupQueue.provider';
import { DeleteDrinkCommand } from './deleteDrink.dtos';

export class DeleteDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private cleanupQueueProvider: ICleanupQueueProvider,
	) {}

	async execute({ id, actor }: DeleteDrinkCommand) {
		const drinkExists = await this.drinksRepository.findById(id);

		if (!drinkExists) {
			throw new NotFoundError('apiResponses.drinks.notFound', { path: 'DeleteDrink.service' });
		}

		assertCanChangeDrink('delete', drinkExists, actor, 'DeleteDrink.service.forbidden');

		await this.drinksRepository.delete(id);

		// Nothing references the drink anymore, so its engagement and files are cleaned up in the background.
		await enqueueCleanupJobs(
			this.cleanupQueueProvider,
			[
				deleteDrinkEngagementJob(id),
				...(drinkExists.cover ? [deleteStorageFileJob(drinkExists.cover.name)] : []),
				...(drinkExists.thumbnail ? [deleteStorageFileJob(drinkExists.thumbnail.name)] : []),
			],
			{ drinkId: id },
		);
	}
}
