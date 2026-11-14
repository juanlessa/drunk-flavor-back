/**
 * A position in a list ordered newest first: the creation date plus the id as the tie-breaker, so two
 * records created in the same millisecond keep a stable order.
 */
export type TimeCursor = {
	createdAt: Date;
	id: string;
};
