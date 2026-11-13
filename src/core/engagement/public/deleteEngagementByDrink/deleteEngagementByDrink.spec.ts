import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { CommentsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Comments.repository';
import { FavoritesRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Favorites.repository';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { DeleteEngagementByDrinkService } from './DeleteEngagementByDrink.service';

let commentsRepository: CommentsRepositoryInMemory;
let ratingsRepository: RatingsRepositoryInMemory;
let favoritesRepository: FavoritesRepositoryInMemory;
let service: DeleteEngagementByDrinkService;

describe('Delete Engagement By Drink', () => {
	beforeEach(() => {
		commentsRepository = new CommentsRepositoryInMemory();
		ratingsRepository = new RatingsRepositoryInMemory();
		favoritesRepository = new FavoritesRepositoryInMemory();
		service = new DeleteEngagementByDrinkService(commentsRepository, ratingsRepository, favoritesRepository);
	});

	it('deletes the comments, ratings and favorites of the drink and returns the counts', async () => {
		const drinkId = new ObjectId().toString();
		const otherDrinkId = new ObjectId().toString();
		await commentsRepository.create({ drinkId, userId: new ObjectId().toString(), content: 'first' });
		await commentsRepository.create({ drinkId, userId: new ObjectId().toString(), content: 'second' });
		await commentsRepository.create({ drinkId: otherDrinkId, userId: new ObjectId().toString(), content: 'other' });
		await ratingsRepository.create({ drinkId, userId: new ObjectId().toString(), value: 5 });
		await ratingsRepository.create({ drinkId: otherDrinkId, userId: new ObjectId().toString(), value: 3 });

		await favoritesRepository.add({ drinkId, userId: new ObjectId().toString() });
		await favoritesRepository.add({ drinkId: otherDrinkId, userId: new ObjectId().toString() });

		await expect(service.execute({ drinkId })).resolves.toEqual({ comments: 2, ratings: 1, favorites: 1 });
		expect(commentsRepository.collection).toHaveLength(1);
		expect(ratingsRepository.collection).toHaveLength(1);
		expect(favoritesRepository.collection).toHaveLength(1);
	});

	it('is idempotent: repeating it deletes nothing', async () => {
		const drinkId = new ObjectId().toString();
		await commentsRepository.create({ drinkId, userId: new ObjectId().toString(), content: 'first' });
		await favoritesRepository.add({ drinkId, userId: new ObjectId().toString() });
		await service.execute({ drinkId });
		await expect(service.execute({ drinkId })).resolves.toEqual({ comments: 0, ratings: 0, favorites: 0 });
	});
});
