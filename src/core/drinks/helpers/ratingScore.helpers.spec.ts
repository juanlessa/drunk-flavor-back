import { describe, expect, it } from 'vitest';
import { RATING_PRIOR_MEAN } from '@/core/drinks/constants/drink.constants';
import { getRatingScore } from './ratingScore.helpers';

/** The score of a drink rated `count` times with the same value. */
const scoreOf = (value: number, count: number) => getRatingScore(value * count, count);

describe('getRatingScore', () => {
	it('is the prior mean for a drink with no rating', () => {
		expect(getRatingScore(0, 0)).toBe(RATING_PRIOR_MEAN);
	});

	it('pulls the average of a drink with few ratings toward the prior mean', () => {
		expect(scoreOf(5, 1)).toBeCloseTo(20 / 6);
		expect(scoreOf(1, 1)).toBeCloseTo(16 / 6);
	});

	it('ranks many good ratings above a single perfect one', () => {
		expect(scoreOf(4, 10)).toBeGreaterThan(scoreOf(5, 1));
	});

	it('ranks a drink with no rating above a badly rated one and below a well rated one', () => {
		expect(getRatingScore(0, 0)).toBeGreaterThan(scoreOf(1, 3));
		expect(getRatingScore(0, 0)).toBeLessThan(scoreOf(5, 3));
	});

	it('nears the real average as the ratings grow', () => {
		expect(scoreOf(4, 10_000)).toBeCloseTo(4, 2);
	});

	it('ranks the better average first between drinks with the same number of ratings', () => {
		expect(scoreOf(4, 8)).toBeGreaterThan(scoreOf(3.5, 8));
	});
});
