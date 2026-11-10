import { AuthorshipMetadata } from '@/shared/types/entity.types';

/**
 * The record without who created and last edited it. Public reads use it: the authorship (user ids) is shown only to
 * the people who manage the records.
 */
export const omitAuthorship = <T extends AuthorshipMetadata>(record: T): Omit<T, keyof AuthorshipMetadata> => {
	const { createdBy: _createdBy, updatedBy: _updatedBy, ...rest } = record;
	return rest;
};
