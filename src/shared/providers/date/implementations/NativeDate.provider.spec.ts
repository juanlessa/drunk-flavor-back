import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IDateProvider } from '../IDateProvider';
import { NativeDateProvider } from './NativeDate.provider';

const SYSTEM_TIME = new Date('2024-01-15T12:00:00.000Z');

let dateProvider: IDateProvider;

describe('NativeDateProvider', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(SYSTEM_TIME);
		dateProvider = new NativeDateProvider();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should return the current date and time', () => {
		expect(dateProvider.dateNow()).toEqual(SYSTEM_TIME);
	});

	it('should compare two dates in hours', () => {
		const startDate = new Date('2024-01-01T00:00:00.000Z');
		const endDate = new Date('2024-01-01T02:00:00.000Z');

		expect(dateProvider.compareInHours(startDate, endDate)).toBe(2);
	});

	it.each([
		{
			startDate: new Date('2024-01-01T00:00:00.000Z'),
			endDate: new Date('2024-01-01T01:59:59.999Z'),
			expected: 1,
		},
		{
			startDate: new Date('2024-01-01T02:00:00.000Z'),
			endDate: new Date('2024-01-01T00:00:00.001Z'),
			expected: -1,
		},
	])('should truncate partial hour differences toward zero', ({ startDate, endDate, expected }) => {
		expect(dateProvider.compareInHours(startDate, endDate)).toBe(expected);
	});

	it('should compare two dates in days', () => {
		const startDate = new Date('2024-01-01T00:00:00.000Z');
		const endDate = new Date('2024-01-03T00:00:00.000Z');

		expect(dateProvider.compareInDays(startDate, endDate)).toBe(2);
	});

	it.each([
		{
			startDate: new Date('2024-01-01T00:00:00.000Z'),
			endDate: new Date('2024-01-03T23:59:59.999Z'),
			expected: 2,
		},
		{
			startDate: new Date('2024-01-04T00:00:00.000Z'),
			endDate: new Date('2024-01-01T00:00:00.001Z'),
			expected: -2,
		},
	])('should truncate partial day differences toward zero', ({ startDate, endDate, expected }) => {
		expect(dateProvider.compareInDays(startDate, endDate)).toBe(expected);
	});

	it('should convert a date to an ISO UTC string', () => {
		const date = new Date('2024-01-01T03:30:45.123+03:00');

		expect(dateProvider.convertToUTC(date)).toBe('2024-01-01T00:30:45.123Z');
	});

	it('should add days without mutating the original date', () => {
		const date = new Date('2024-01-15T12:00:00.000Z');
		const originalTime = date.getTime();

		const newDate = dateProvider.addDays(5, date);

		expect(newDate).toEqual(new Date('2024-01-20T12:00:00.000Z'));
		expect(date.getTime()).toBe(originalTime);
		expect(newDate).not.toBe(date);
	});

	it('should add days to the current date', () => {
		expect(dateProvider.addDaysToCurrentTime(3)).toEqual(new Date('2024-01-18T12:00:00.000Z'));
	});

	it('should add hours without mutating the original date', () => {
		const date = new Date('2024-01-01T00:00:00.000Z');
		const originalTime = date.getTime();

		const newDate = dateProvider.addHours(3, date);

		expect(newDate).toEqual(new Date('2024-01-01T03:00:00.000Z'));
		expect(date.getTime()).toBe(originalTime);
	});

	it('should subtract hours when given a negative value', () => {
		const date = new Date('2024-01-01T03:00:00.000Z');

		expect(dateProvider.addHours(-3, date)).toEqual(new Date('2024-01-01T00:00:00.000Z'));
	});

	it('should add hours to the current date', () => {
		expect(dateProvider.addHoursToCurrentTime(2)).toEqual(new Date('2024-01-15T14:00:00.000Z'));
	});

	it('should add minutes to a given date', () => {
		const date = new Date('2024-01-01T00:00:00.000Z');

		expect(dateProvider.addMinutes(30, date)).toEqual(new Date('2024-01-01T00:30:00.000Z'));
	});

	it('should add minutes to the current date', () => {
		expect(dateProvider.addMinutesToCurrentTime(10)).toEqual(new Date('2024-01-15T12:10:00.000Z'));
	});

	it('should add seconds to a given date', () => {
		const date = new Date('2024-01-01T00:00:00.000Z');

		expect(dateProvider.addSeconds(45, date)).toEqual(new Date('2024-01-01T00:00:45.000Z'));
	});

	it('should add seconds to the current date', () => {
		expect(dateProvider.addSecondsToCurrentTime(5)).toEqual(new Date('2024-01-15T12:00:05.000Z'));
	});

	it('should report whether one date is strictly before another', () => {
		const earlierDate = new Date('2024-01-01T00:00:00.000Z');
		const laterDate = new Date('2024-01-02T00:00:00.000Z');

		expect(dateProvider.compareIfBefore(earlierDate, laterDate)).toBe(true);
		expect(dateProvider.compareIfBefore(laterDate, earlierDate)).toBe(false);
		expect(dateProvider.compareIfBefore(earlierDate, earlierDate)).toBe(false);
	});

	it('should report only dates before the current time as expired', () => {
		const pastDate = new Date('2024-01-15T11:59:59.999Z');
		const futureDate = new Date('2024-01-15T12:00:00.001Z');

		expect(dateProvider.isExpiredDate(pastDate)).toBe(true);
		expect(dateProvider.isExpiredDate(SYSTEM_TIME)).toBe(false);
		expect(dateProvider.isExpiredDate(futureDate)).toBe(false);
	});
});
