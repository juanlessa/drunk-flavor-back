import { Favorite } from '@/core/engagement/entities/favorite.entity';
import {
	mapObjectEntriesDeep,
	toDomainEntry,
	toObjectId,
	toPersistenceEntry,
	toPlainObject,
} from '@/infrastructure/mongo/helpers/mapper.helpers';
import { DeepPartial } from '@/shared/types/utility.types';
import { FavoritePersistence } from '../entities/favorite.model';

export const FavoriteMapper = {
	toDomain(document: FavoritePersistence): Favorite {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, {
			nullHandling: 'toUndefined',
		}) as Favorite;
	},
	toPersistence(data: DeepPartial<Favorite>): Partial<FavoritePersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<FavoritePersistence>;
	},
	toObjectId,
};
