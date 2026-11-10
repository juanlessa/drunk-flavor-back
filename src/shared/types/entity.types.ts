export type EntityMetadata = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
};

/** Who created a record and who changed it last. Both are absent once the account that wrote them was closed. */
export type AuthorshipMetadata = {
	createdBy?: string;
	updatedBy?: string;
};

export type AuthoredEntityMetadata = EntityMetadata & AuthorshipMetadata;
