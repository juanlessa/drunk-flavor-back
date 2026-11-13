import { CreateFavorite, FavoriteListQuery, FavoritePage, RemoveFavorite } from '@/core/engagement/dtos/favorite.dtos';
import { Favorite } from '@/core/engagement/entities/favorite.entity';

export interface IFavoritesRepository {
	/** Saves the favorite. Idempotent: when the user already has the drink as favorite, returns the existing one. */
	add(data: CreateFavorite): Promise<Favorite>;
	findByDrinkAndUser(drinkId: string, userId: string): Promise<Favorite | null>;
	countByUser(userId: string): Promise<number>;
	/** Removes the favorite. Idempotent: returns whether there was one to remove. */
	remove(data: RemoveFavorite): Promise<boolean>;
	/** The user's favorites, newest first, after `query.cursor` when given. */
	findPageByUser(userId: string, query: FavoriteListQuery): Promise<FavoritePage>;
	findDrinkIdsByUser(userId: string): Promise<string[]>;
	deleteByUser(userId: string): Promise<number>;
	deleteByDrink(drinkId: string): Promise<number>;
}
