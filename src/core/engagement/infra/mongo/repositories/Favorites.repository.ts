import { CreateFavorite, FavoriteListQuery, FavoritePage, RemoveFavorite } from '@/core/engagement/dtos/favorite.dtos';
import { Favorite } from '@/core/engagement/entities/favorite.entity';
import {
	FAVORITE_DRINK_USER_UNIQUE_INDEX,
	FavoriteModel,
	FavoritePersistence,
} from '@/core/engagement/infra/mongo/entities/favorite.model';
import { FavoriteMapper } from '@/core/engagement/infra/mongo/mappers/favorite.mapper';
import { IFavoritesRepository } from '@/core/engagement/repositories/IFavorites.repository';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { QueryFilter } from 'mongoose';

export class FavoritesRepository implements IFavoritesRepository {
	async add({ drinkId, userId }: CreateFavorite): Promise<Favorite> {
		const filter = { drink_id: drinkId, user_id: userId };
		try {
			const document = await FavoriteModel.findOneAndUpdate(
				filter,
				{ $setOnInsert: filter },
				{ upsert: true, returnDocument: 'after' },
			)
				.lean<FavoritePersistence>()
				.exec();
			return FavoriteMapper.toDomain(document);
		} catch (error) {
			// Two concurrent first calls can both try to insert; the loser reads what the winner stored.
			if (isDuplicateKeyError(error, [FAVORITE_DRINK_USER_UNIQUE_INDEX])) {
				const document = await FavoriteModel.findOne(filter).lean<FavoritePersistence>().exec();
				if (document) return FavoriteMapper.toDomain(document);
			}
			throw error;
		}
	}

	async findByDrinkAndUser(drinkId: string, userId: string): Promise<Favorite | null> {
		const document = await FavoriteModel.findOne({ drink_id: drinkId, user_id: userId })
			.lean<FavoritePersistence>()
			.exec();
		return document ? FavoriteMapper.toDomain(document) : null;
	}

	async countByUser(userId: string): Promise<number> {
		return FavoriteModel.countDocuments({ user_id: userId }).exec();
	}

	async remove({ drinkId, userId }: RemoveFavorite): Promise<boolean> {
		const result = await FavoriteModel.deleteOne({ drink_id: drinkId, user_id: userId }).exec();
		return result.deletedCount > 0;
	}

	async findPageByUser(userId: string, { limit, cursor }: FavoriteListQuery): Promise<FavoritePage> {
		const filter: QueryFilter<FavoritePersistence> = { user_id: userId };
		if (cursor) {
			const cursorId = FavoriteMapper.toObjectId(cursor.id);
			// A cursor made by this API always holds an ObjectId; anything else matches nothing.
			if (!cursorId) return { items: [], nextCursor: null };
			filter.$or = [
				{ created_at: { $lt: cursor.createdAt } },
				{ created_at: cursor.createdAt, _id: { $lt: cursorId } },
			];
		}
		// One extra record tells whether there is another page without a count.
		const documents = await FavoriteModel.find(filter)
			.sort({ created_at: -1, _id: -1 })
			.limit(limit + 1)
			.lean<FavoritePersistence[]>()
			.exec();
		const items = documents.slice(0, limit).map(FavoriteMapper.toDomain);
		const last = items[items.length - 1];
		return { items, nextCursor: documents.length > limit ? { createdAt: last.createdAt, id: last.id } : null };
	}

	async findDrinkIdsByUser(userId: string): Promise<string[]> {
		const documents = await FavoriteModel.find({ user_id: userId })
			.sort({ created_at: -1, _id: -1 })
			.select('drink_id')
			.lean<Pick<FavoritePersistence, 'drink_id'>[]>()
			.exec();
		return documents.map((document) => document.drink_id);
	}

	async deleteByUser(userId: string): Promise<number> {
		const result = await FavoriteModel.deleteMany({ user_id: userId }).exec();
		return result.deletedCount;
	}

	async deleteByDrink(drinkId: string): Promise<number> {
		const result = await FavoriteModel.deleteMany({ drink_id: drinkId }).exec();
		return result.deletedCount;
	}
}
