import { randomUUID } from 'node:crypto';
import { CreateFavorite, FavoriteListQuery, FavoritePage, RemoveFavorite } from '@/core/engagement/dtos/favorite.dtos';
import { Favorite } from '@/core/engagement/entities/favorite.entity';
import { IFavoritesRepository } from '@/core/engagement/repositories/IFavorites.repository';

/** Newest first; the id breaks ties so the order is the same on every page. */
const compareNewestFirst = (a: Favorite, b: Favorite): number =>
	b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id);

export class FavoritesRepositoryInMemory implements IFavoritesRepository {
	collection: Favorite[] = [];

	async add({ drinkId, userId }: CreateFavorite): Promise<Favorite> {
		const existing = this.collection.find((record) => record.drinkId === drinkId && record.userId === userId);
		if (existing) return existing;
		const record: Favorite = { id: randomUUID(), drinkId, userId, createdAt: new Date() };
		this.collection.push(record);
		return record;
	}

	async findByDrinkAndUser(drinkId: string, userId: string): Promise<Favorite | null> {
		return this.collection.find((record) => record.drinkId === drinkId && record.userId === userId) ?? null;
	}

	async countByUser(userId: string): Promise<number> {
		return this.collection.filter((record) => record.userId === userId).length;
	}

	async remove({ drinkId, userId }: RemoveFavorite): Promise<boolean> {
		return this.deleteMatching((record) => record.drinkId === drinkId && record.userId === userId) > 0;
	}

	async findPageByUser(userId: string, { limit, cursor }: FavoriteListQuery): Promise<FavoritePage> {
		const ordered = this.collection.filter((record) => record.userId === userId).sort(compareNewestFirst);
		const afterCursor = cursor
			? ordered.filter(
					(record) =>
						record.createdAt.getTime() < cursor.createdAt.getTime() ||
						(record.createdAt.getTime() === cursor.createdAt.getTime() &&
							record.id.localeCompare(cursor.id) < 0),
				)
			: ordered;
		const items = afterCursor.slice(0, limit);
		const last = items[items.length - 1];
		const hasMore = afterCursor.length > limit;
		return { items, nextCursor: hasMore ? { createdAt: last.createdAt, id: last.id } : null };
	}

	async findDrinkIdsByUser(userId: string): Promise<string[]> {
		return this.collection
			.filter((record) => record.userId === userId)
			.sort(compareNewestFirst)
			.map((record) => record.drinkId);
	}

	async deleteByUser(userId: string): Promise<number> {
		return this.deleteMatching((record) => record.userId === userId);
	}

	async deleteByDrink(drinkId: string): Promise<number> {
		return this.deleteMatching((record) => record.drinkId === drinkId);
	}

	private deleteMatching(predicate: (record: Favorite) => boolean): number {
		const initialLength = this.collection.length;
		this.collection = this.collection.filter((record) => !predicate(record));
		return initialLength - this.collection.length;
	}
}
