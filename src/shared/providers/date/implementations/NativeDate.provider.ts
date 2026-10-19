import { IDateProvider } from '../IDateProvider';

const MILLISECONDS_PER_SECOND = 1_000;
const MILLISECONDS_PER_MINUTE = 60 * MILLISECONDS_PER_SECOND;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

export class NativeDateProvider implements IDateProvider {
	compareInHours(startDate: Date, endDate: Date): number {
		return Math.trunc((endDate.getTime() - startDate.getTime()) / MILLISECONDS_PER_HOUR);
	}

	compareInDays(startDate: Date, endDate: Date): number {
		return Math.trunc((endDate.getTime() - startDate.getTime()) / MILLISECONDS_PER_DAY);
	}

	convertToUTC(date: Date): string {
		return date.toISOString();
	}

	dateNow(): Date {
		return new Date();
	}

	addDays(days: number, date: Date): Date {
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	}

	addDaysToCurrentTime(days: number): Date {
		return this.addDays(days, this.dateNow());
	}

	addHours(hours: number, date: Date): Date {
		return this.addMilliseconds(hours * MILLISECONDS_PER_HOUR, date);
	}

	addHoursToCurrentTime(hours: number): Date {
		return this.addHours(hours, this.dateNow());
	}

	addMinutes(minutes: number, date: Date): Date {
		return this.addMilliseconds(minutes * MILLISECONDS_PER_MINUTE, date);
	}

	addMinutesToCurrentTime(minutes: number): Date {
		return this.addMinutes(minutes, this.dateNow());
	}

	addSeconds(seconds: number, date: Date): Date {
		return this.addMilliseconds(seconds * MILLISECONDS_PER_SECOND, date);
	}

	addSecondsToCurrentTime(seconds: number): Date {
		return this.addSeconds(seconds, this.dateNow());
	}

	compareIfBefore(dateA: Date, dateB: Date): boolean {
		return dateA.getTime() < dateB.getTime();
	}

	isExpiredDate(date: Date): boolean {
		return this.compareIfBefore(date, this.dateNow());
	}

	private addMilliseconds(milliseconds: number, date: Date): Date {
		return new Date(date.getTime() + milliseconds);
	}
}
