export interface MJMLJsonWithChildren {
	tagName: string;
	attributes: object;
	children: MJMLJsonObject[];
}

export interface MJMLJsonWithContent {
	tagName: string;
	attributes: object;
	content: string;
}

export interface MJMLJsonSelfClosingTag {
	tagName: string;
	attributes: object;
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
