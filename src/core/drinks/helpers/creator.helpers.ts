type WithCreator = { createdBy?: string };

/** Moves the records created by `userId` first, keeping the order inside each group. */
export const prioritizeCreator = <T extends WithCreator>(items: T[], userId: string): T[] => [
	...items.filter((item) => item.createdBy === userId),
	...items.filter((item) => item.createdBy !== userId),
];

/** Removes `userId` as creator and last editor of the records, in place. Returns how many records were touched. */
export const clearCreatorFromRecords = (records: (WithCreator & { updatedBy?: string })[], userId: string): number => {
	let touched = 0;
	for (const record of records) {
		const wasCreator = record.createdBy === userId;
		const wasEditor = record.updatedBy === userId;
		if (wasCreator) delete record.createdBy;
		if (wasEditor) delete record.updatedBy;
		if (wasCreator || wasEditor) touched += 1;
	}
	return touched;
};

/** The creator of a record never changes, so an update keeps the one it had (as the `immutable` field does in Mongo). */
export const keepCreator = <T extends WithCreator>(updated: T, current: WithCreator): T => {
	const { createdBy: _ignored, ...rest } = updated;
	return (current.createdBy === undefined ? rest : { ...rest, createdBy: current.createdBy }) as T;
};
