import { BusboyFileStream } from '@fastify/busboy';
import { Readable } from 'node:stream';

export type FileStream = BusboyFileStream;

type BodyEntry = {
	data: Buffer;
	filename: string;
	encoding: string;
	mimetype: string;
	limit: false;
};

export type FileHandler = (
	fieldName: string,
	stream: Readable,
	filename: string,
	encoding: string,
	mimetype: string,
	body: Record<string, BodyEntry>,
) => void | Promise<void>;
