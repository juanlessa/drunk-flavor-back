import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { CreateUser, UpdateUser } from '@/core/accounts/dtos/user.dtos';
import { ObjectId } from 'mongodb';
import { CompleteUser, IncompleteProfileUser, User } from '@/core/accounts/entities/user.entity';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { QueryParams } from '@/shared/types/query.types';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';

export class UsersRepositoryInMemory implements IUsersRepository {
	collection: User[] = [];

	async create(data: CreateUser): Promise<User> {
		const base = {
			_id: new ObjectId(),
			email: data.email,
			email_verified: data.email_verified ?? false,
			avatar_url: data.avatar_url,
			role: data.role,
			created_at: new Date(),
			updated_at: new Date(),
		};

		let record: User;
		if (data.status === UserStatuses.incomplete_profile) {
			const incomplete: IncompleteProfileUser = {
				...base,
				status: UserStatuses.incomplete_profile,
				name: data.name,
				surname: data.surname,
			};
			record = incomplete;
		} else {
			const complete: CompleteUser = {
				...base,
				status: data.status,
				name: data.name ?? '',
				surname: data.surname ?? '',
			};
			record = complete;
		}

		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateUser): Promise<User> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.users.notFound', {
				path: 'Users.repository.update',
				cause: 'Error on findOneAndUpdate operation',
			});
		}

		const current = this.collection[recordIndex];
		// deepUpdate only iterates existing keys, so fields absent from the stored
		// record (e.g. name/surname on an incomplete_profile user being completed)
		// must be added explicitly from the update payload.
		const merged = { ...deepUpdate(data, current), ...data, updated_at: new Date() };

		// Rebuild as the correct User variant so the discriminated union holds: an
		// incomplete_profile user keeps optional name/surname; any other status
		// requires them (completing a profile sends both in `data`).
		let record: User;
		if (merged.status === UserStatuses.incomplete_profile) {
			record = { ...merged, status: UserStatuses.incomplete_profile };
		} else {
			record = { ...merged, status: merged.status, name: merged.name ?? '', surname: merged.surname ?? '' };
		}

		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<User> {
		const recordIndex = this.collection.findIndex((rec) => rec._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.users.notFound', {
				path: 'Users.repository.delete',
				cause: 'Error on findOneAndDelete operation',
			});
		}

		const [deletedRecord] = this.collection.splice(recordIndex, 1);
		return deletedRecord;
	}

	async findByEmail(email: string): Promise<User | null> {
		const recordFound = this.collection.find((rec) => rec.email === email);
		return recordFound || null;
	}

	async findById(id: string): Promise<User | null> {
		const recordFound = this.collection.find((rec) => rec._id.toString() === id);
		return recordFound || null;
	}

	async findAll(query: QueryParams): Promise<User[]> {
		let found = [...this.collection];

		if (query.search) {
			found = filterItemsBySearchCriteria(found, query.search);
		}

		if (query.sort) {
			found = sortItemsByFields(found, query.sort);
		}

		found = paginateItems(
			found,
			query.limit || DEFAULT_QUERY_PARAMS.limit,
			query.page || DEFAULT_QUERY_PARAMS.page,
		);

		return found;
	}
}
