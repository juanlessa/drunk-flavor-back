import type { Drink } from '@/core/drinks/public';
import { Favorite } from '@/core/engagement/entities/favorite.entity';
import { TimeCursor } from '@/shared/types/cursor.types';
import { AuthorshipMetadata } from '@/shared/types/entity.types';

export type CreateFavorite = {
	drinkId: string;
	userId: string;
};

export type RemoveFavorite = {
	drinkId: string;
	userId: string;
};

export type FavoriteListQuery = {
	limit: number;
	cursor?: TimeCursor;
};

export type FavoritePage = {
	items: Favorite[];
	nextCursor: TimeCursor | null;
};

export type FavoriteWithDrink = Favorite & {
	drink: Omit<Drink, keyof AuthorshipMetadata>;
};

export type FavoriteWithDrinkPage = {
	items: FavoriteWithDrink[];
	nextCursor: string | null;
};

export type FavoriteDrinkIds = {
	drinkIds: string[];
};
