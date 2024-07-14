export type SortOrder = -1 | 1 | 'asc' | 'ascending' | 'desc' | 'descending';

export type QueryParams = {
	limit?: number;
	page?: number;
	search?: { [k: string]: string | undefined };
	sort?: { [k: string]: SortOrder | undefined };
};
