import { describe, expect, it } from 'vitest';
import { limitSchema, pageSchema } from '@/shared/schemas/query.schemas';
import { MAX_QUERY_LIMIT } from '@/shared/constants/query.constants';

describe('limitSchema', () => {
	it('should accept an in-range value', () => {
		expect(limitSchema.safeParse(10).success).toBe(true);
	});

	it('should accept the maximum value', () => {
		expect(limitSchema.safeParse(MAX_QUERY_LIMIT).success).toBe(true);
	});

	it('should accept undefined', () => {
		expect(limitSchema.safeParse(undefined).success).toBe(true);
	});

	it('should reject zero', () => {
		expect(limitSchema.safeParse(0).success).toBe(false);
	});

	it('should reject a negative value', () => {
		expect(limitSchema.safeParse(-1).success).toBe(false);
	});

	it('should reject a float value', () => {
		expect(limitSchema.safeParse(1.5).success).toBe(false);
	});

	it('should reject a value greater than the maximum', () => {
		expect(limitSchema.safeParse(MAX_QUERY_LIMIT + 1).success).toBe(false);
	});
});

describe('pageSchema', () => {
	it('should accept a value greater than or equal to 1', () => {
		expect(pageSchema.safeParse(1).success).toBe(true);
	});

	it('should accept undefined', () => {
		expect(pageSchema.safeParse(undefined).success).toBe(true);
	});

	it('should reject zero', () => {
		expect(pageSchema.safeParse(0).success).toBe(false);
	});

	it('should reject a negative value', () => {
		expect(pageSchema.safeParse(-1).success).toBe(false);
	});

	it('should reject a float value', () => {
		expect(pageSchema.safeParse(2.5).success).toBe(false);
	});
});
