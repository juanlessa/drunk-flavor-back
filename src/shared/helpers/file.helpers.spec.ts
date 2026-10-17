import { describe, expect, it } from 'vitest';
import { assertSafeFileName, generateStoredFileName } from './file.helpers';

describe('file.helpers security', () => {
	describe('generateStoredFileName', () => {
		it('builds a <hash>-<ownerId>-<role>.<ext> name derived from the mime type', () => {
			const name = generateStoredFileName('6ad380bdb3f25398e6d87a44', 'cover', 'image/png');
			expect(name).toMatch(/^[0-9a-f]{32}-6ad380bdb3f25398e6d87a44-cover\.png$/);
		});

		it('uses the role segment to distinguish cover and thumbnail', () => {
			const cover = generateStoredFileName('6ad380bdb3f25398e6d87a44', 'cover', 'image/webp');
			const thumbnail = generateStoredFileName('6ad380bdb3f25398e6d87a44', 'thumbnail', 'image/webp');
			expect(cover).toContain('-cover.webp');
			expect(thumbnail).toContain('-thumbnail.webp');
		});

		it('produces a different hash on each call (entropy)', () => {
			const first = generateStoredFileName('6ad380bdb3f25398e6d87a44', 'cover', 'image/png');
			const second = generateStoredFileName('6ad380bdb3f25398e6d87a44', 'cover', 'image/png');
			expect(first).not.toBe(second);
		});

		it('never embeds a client-controlled file name', () => {
			// The function takes no client name at all; traversal strings cannot appear.
			const name = generateStoredFileName('6ad380bdb3f25398e6d87a44', 'cover', 'image/png');
			expect(name).not.toContain('..');
			expect(name).not.toContain('/');
		});
	});

	describe('assertSafeFileName', () => {
		it.each(['../../../etc/passwd', '..', 'foo/bar.png', 'foo\\bar.png', 'with\0null.png', '/absolute.png', ''])(
			'rejects the unsafe name %j',
			(name) => {
				expect(() => assertSafeFileName(name)).toThrow();
			},
		);

		it.each(['abc123-6ad380bdb3f25398e6d87a44-cover.png', 'simple.png', 'name-with-dashes.webp'])(
			'accepts the safe name %j',
			(name) => {
				expect(() => assertSafeFileName(name)).not.toThrow();
			},
		);
	});
});
