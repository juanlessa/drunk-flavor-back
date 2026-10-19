export interface MJMLJsonWithChildren {
	tagName: string;
	attributes: Record<string, unknown>;
	children: MJMLJsonObject[];
}

export interface MJMLJsonWithContent {
	tagName: string;
	attributes: Record<string, unknown>;
	content: string;
}

export interface MJMLJsonSelfClosingTag {
	tagName: string;
	attributes: Record<string, unknown>;
}

export interface MJMLParseError {
	line: number;
	message: string;
	tagName: string;
	formattedMessage: string;
}

export type MJMLJsonObject = MJMLJsonWithChildren | MJMLJsonWithContent | MJMLJsonSelfClosingTag;

export interface MJMLParseResults {
	html: string;
	json: MJMLJsonObject;
	errors: MJMLParseError[];
}
