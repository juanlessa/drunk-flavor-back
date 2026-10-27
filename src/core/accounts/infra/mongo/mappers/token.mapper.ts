import { Token } from '@/core/accounts/entities/token.entity';
import { TokenPersistence } from '../entities/token.model';
import {
	mapObjectEntriesDeep,
	toDomainEntry,
	toObjectId,
	toPersistenceEntry,
	toPlainObject,
} from '@/infrastructure/mongo/helpers/mapper.helpers';

export const TokenMapper = {
	toDomain(document: TokenPersistence): Token {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, {
			nullHandling: 'toUndefined',
		}) as Token;
	},
	toPersistence(data: Partial<Token>): Partial<TokenPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<TokenPersistence>;
	},
	toObjectId,
};
