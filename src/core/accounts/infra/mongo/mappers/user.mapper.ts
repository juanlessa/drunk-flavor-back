import { User } from '@/core/accounts/entities/user.entity';
import { QueryParams } from '@/shared/types/query.types';
import { UserPersistence } from '../entities/user.model';
import {
	mapObjectEntriesDeep,
	mapQueryFields,
	toDomainEntry,
	toObjectId,
	toPersistenceEntry,
	toPlainObject,
} from '@/infrastructure/mongo/helpers/mapper.helpers';

export const UserMapper = {
	toDomain(document: UserPersistence): User {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, {
			nullHandling: 'toUndefined',
		}) as User;
	},
	toPersistence(data: Partial<User>): Partial<UserPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<UserPersistence>;
	},
	toObjectId,
	toPersistenceQuery(query: QueryParams): QueryParams {
		return {
			...query,
			search: query.search,
			sort: mapQueryFields(query.sort),
		};
	},
};
