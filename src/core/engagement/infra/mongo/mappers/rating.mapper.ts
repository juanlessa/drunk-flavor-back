import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { Rating } from '@/core/engagement/entities/rating.entity';
import {
	mapObjectEntriesDeep,
	mapQueryFields,
	toDomainEntry,
	toObjectId,
	toPersistenceEntry,
	toPlainObject,
} from '@/infrastructure/mongo/helpers/mapper.helpers';
import { DeepPartial } from '@/shared/types/utility.types';
import { RatingPersistence } from '../entities/rating.model';

export const RatingMapper = {
	toDomain(document: RatingPersistence): Rating {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, { nullHandling: 'toUndefined' }) as Rating;
	},
	toPersistence(data: DeepPartial<Rating>): Partial<RatingPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<RatingPersistence>;
	},
	toObjectId,
	toPersistenceSort(sort: RatingListQuery['sort']): Record<string, 1 | -1> {
		return mapQueryFields(sort) ?? {};
	},
};
