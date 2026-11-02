import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { FindPublicProfilesByIds, PublicProfile } from './findPublicProfilesByIds.dtos';

export class FindPublicProfilesByIdsService {
	constructor(private usersRepository: IUsersRepository) {}

	/** Resolves the public profile of each existing user; duplicates are collapsed and missing users omitted. */
	async execute({ userIds }: FindPublicProfilesByIds): Promise<PublicProfile[]> {
		const uniqueIds = [...new Set(userIds)];
		if (uniqueIds.length === 0) {
			return [];
		}
		const users = await this.usersRepository.findByIds(uniqueIds);
		return users.map(({ id, name, surname, avatarUrl }) => ({ id, name, surname, avatarUrl }));
	}
}
