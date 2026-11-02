export type ObjectEntry = readonly [key: string, value: unknown];

export type EntryMapper = (key: string, value: unknown) => ObjectEntry | undefined;

export type NullHandling = 'preserve' | 'toUndefined' | 'omit';

export type DeepMapOptions = {
	nullHandling?: NullHandling;
};
