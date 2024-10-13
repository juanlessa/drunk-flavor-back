import { describe, it, expect, beforeEach } from 'vitest';
import { DayjsProvider } from './Dayjs.provider';
import { IDateProvider } from '../IDateProvider';

let dateProvider: IDateProvider;

describe('DayjsProvider', () => {
	beforeEach(() => {
		dateProvider = new DayjsProvider();
	});

	it('should return the current date and time', () => {
		const now = dateProvider.dateNow();
		expect(now).toBeInstanceOf(Date);
		expect(now).toEqual(expect.any(Date));
	});

	it('should compare two dates in hours', () => {
		const startDate = new Date('2024-01-01T00:00:00Z');
		const endDate = new Date('2024-01-01T02:00:00Z');
		const hoursDifference = dateProvider.compareInHours(startDate, endDate);
		expect(hoursDifference).toBe(2);
	});

	it('should compare two dates in days', () => {
		const startDate = new Date('2024-01-01T00:00:00Z');
		const endDate = new Date('2024-01-03T00:00:00Z');
		const daysDifference = dateProvider.compareInDays(startDate, endDate);
		expect(daysDifference).toBe(2);
	});

	it('should convert a date to UTC', () => {
		const date = new Date('2024-01-01T00:00:00Z');
		const utcDate = dateProvider.convertToUTC(date);
		expect(utcDate).toBeDefined();
		expect(utcDate).toContain('+00:00');
	});

	it('should add days to a given date', () => {
		const date = new Date('2024-01-01T00:00:00Z');
		const newDate = dateProvider.addDays(5, date);
		expect(newDate).toEqual(new Date('2024-01-06T00:00:00Z'));
	});

	it('should add days to the current date', () => {
		const currentDate = dateProvider.dateNow();
		const newDate = dateProvider.addDaysToCurrentTime(3);
		expect(newDate.getTime()).toBeGreaterThan(currentDate.getTime());
	});

	it('should add hours to a given date', () => {
		const date = new Date('2024-01-01T00:00:00Z');
		const newDate = dateProvider.addHours(3, date);
		expect(newDate).toEqual(new Date('2024-01-01T03:00:00Z'));
	});

	it('should add hours to the current date', () => {
		const currentDate = dateProvider.dateNow();
		const newDate = dateProvider.addHoursToCurrentTime(2);
		expect(newDate.getTime()).toBeGreaterThan(currentDate.getTime());
	});

	it('should add minutes to a given date', () => {
		const date = new Date('2024-01-01T00:00:00Z');
		const newDate = dateProvider.addMinutes(30, date);
		expect(newDate).toEqual(new Date('2024-01-01T00:30:00Z'));
	});

	it('should add minutes to the current date', () => {
		const currentDate = dateProvider.dateNow();
		const newDate = dateProvider.addMinutesToCurrentTime(10);
		expect(newDate.getTime()).toBeGreaterThan(currentDate.getTime());
	});

	it('should add seconds to a given date', () => {
		const date = new Date('2024-01-01T00:00:00Z');
		const newDate = dateProvider.addSeconds(45, date);
		expect(newDate).toEqual(new Date('2024-01-01T00:00:45Z'));
	});

	it('should add seconds to the current date', () => {
		const currentDate = dateProvider.dateNow();
		const newDate = dateProvider.addSecondsToCurrentTime(5);
		expect(newDate.getTime()).toBeGreaterThan(currentDate.getTime());
	});

	it('should compare if dateA is before dateB', () => {
		const dateA = new Date('2024-01-01T00:00:00Z');
		const dateB = new Date('2024-01-02T00:00:00Z');
		const isBefore = dateProvider.compareIfBefore(dateA, dateB);
		expect(isBefore).toBe(true);
	});

	it('should check if a date is expired', () => {
		const pastDate = new Date(Date.now() - 1000 * 60 * 60);
		const futureDate = new Date(Date.now() + 1000 * 60 * 60);
		const isExpiredPast = dateProvider.isExpiredDate(pastDate);
		const isExpiredFuture = dateProvider.isExpiredDate(futureDate);
		expect(isExpiredPast).toBe(true);
		expect(isExpiredFuture).toBe(false);
	});
});
