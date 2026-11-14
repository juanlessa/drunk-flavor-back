import { assertCanChangeDrink } from '@/core/drinks/helpers/catalogAuthorization.helpers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { deleteStorageFileJob } from '@/shared/providers/queue/cleanup/cleanupJobs';
import { enqueueCleanupJobs } from '@/shared/providers/queue/cleanup/enqueueCleanupJobs.helpers';
import { ICleanupQueueProvider } from '@/shared/providers/queue/cleanup/ICleanupQueue.provider';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';

import { generateStoredFileName, isSupportedFileType } from '@/shared/helpers/file.helpers';
import { UpdateDrinkThumbnailCommand } from './updateDrinkThumbnail.dtos';

export class UpdateDrinkThumbnailService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
		private cleanupQueueProvider: ICleanupQueueProvider,
	) {}

	async execute({ drinkId, fileStream, mimetype, actor }: UpdateDrinkThumbnailCommand): Promise<void> {
		if (!isSupportedFileType('image', mimetype)) {
			throw new BadRequestError('apiResponses.drinks.invalidFileType', {
				path: 'UpdateDrinkThumbnail.service.1',
				cause: 'invalid email',
			});
		}

		const drink = await this.drinksRepository.findById(drinkId);
		if (!drink) {
			throw new NotFoundError('apiResponses.drinks.notFound', { path: 'UpdateDrinkThumbnail.service.2' });
		}
		assertCanChangeDrink('update', drink, actor, 'UpdateDrinkThumbnail.service.forbidden');

		const name = generateStoredFileName(drinkId, 'thumbnail', mimetype);
		const url = '';

		// The new file is stored and referenced before the previous one is released, so a failure
		// at any step never leaves the drink pointing at a file that no longer exists.
		await this.storageProvider.uploadFile({ fileStream, name, mimetype });

		try {
			await this.drinksRepository.update({
				id: drinkId,
				updatedBy: actor.id,
				thumbnail: { name, mimetype, url },
			});
		} catch (error) {
			// The new file is unreferenced; remove it in the background and report the original failure.
			await enqueueCleanupJobs(this.cleanupQueueProvider, [deleteStorageFileJob(name)], { drinkId });
			throw error;
		}

		if (drink.thumbnail) {
			await enqueueCleanupJobs(this.cleanupQueueProvider, [deleteStorageFileJob(drink.thumbnail.name)], {
				drinkId,
			});
		}
	}
}
