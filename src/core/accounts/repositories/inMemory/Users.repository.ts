import { randomUUID } from 'node:crypto';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { CreateUser, UpdateUser } from '@/core/accounts/dtos/user.dtos';
import { User } from '@/core/accounts/entities/user.entity';
import { UserEmailAlreadyExistsError, UserOwnerAlreadyExistsError } from '@/core/accounts/errors/user.errors';
import { Roles, type Role } from '@/shared/accessControl/roles';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { QueryParams } from '@/shared/types/query.types';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';

export class UsersRepositoryInMemory implements IUsersRepository {
	collection: User[] = [];

	async create(data: CreateUser): Promise<User> {
		if (data.role === Roles.owner && this.collection.some((record) => record.role === Roles.owner)) {
			throw new UserOwnerAlreadyExistsError({ path: 'UsersRepositoryInMemory.create' });
		}

		if (this.collection.some((record) => record.email.toLowerCase() === data.email.toLowerCase())) {
			throw new UserEmailAlreadyExistsError({ path: 'UsersRepositoryInMemory.create' });
		}

		const now = new Date();
		const record: User = {
			id: randomUUID(),
			name: data.name,
			surname: data.surname,
			email: data.email,
			emailVerified: data.emailVerified ?? false,
			avatarUrl: data.avatarUrl,
			role: data.role,
			status: data.status,
			createdAt: now,
			updatedAt: now,
		};

		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateUser): Promise<User> {
		const recordIndex = this.collection.findIndex((record) => record.id === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.users.notFound', {
				path: 'Users.repository.update',
				cause: 'Error on findOneAndUpdate operation',
			});
		}

		const current = this.collection[recordIndex];
		if (
			data.role === Roles.owner &&
			this.collection.some((candidate, index) => index !== recordIndex && candidate.role === Roles.owner)
		) {
			throw new UserOwnerAlreadyExistsError({ path: 'UsersRepositoryInMemory.update' });
		}

		const record: User = { ...deepUpdate(data, current), ...data, updatedAt: new Date() };
		if (
			data.email !== undefined &&
			this.collection.some(
				(candidate, index) =>
					index !== recordIndex && candidate.email.toLowerCase() === data.email?.toLowerCase(),
			)
		) {
			throw new UserEmailAlreadyExistsError({ path: 'UsersRepositoryInMemory.update' });
		}

		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<User> {
		const recordIndex = this.collection.findIndex((record) => record.id === id);
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
		const recordFound = this.collection.find((record) => record.email === email);
		return recordFound || null;
	}

	async findByRole(role: Role): Promise<User | null> {
		const recordFound = this.collection.find((record) => record.role === role);
		return recordFound || null;
	}

	async findById(id: string): Promise<User | null> {
		const recordFound = this.collection.find((record) => record.id === id);
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
