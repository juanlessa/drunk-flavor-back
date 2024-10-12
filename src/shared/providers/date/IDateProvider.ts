export interface IDateProvider {
	compareInHours(start_date: Date, end_date: Date): number;
	compareInDays(start_date: Date, end_date: Date): number;
	convertToUTC(date: Date): string;
	dateNow(): Date;
	addDays(days: number, date: Date): Date;
	addDaysToCurrentTime(days: number): Date;
	addHours(hours: number, date: Date): Date;
	addHoursToCurrentTime(hours: number): Date;
	addMinutes(minutes: number, date: Date): Date;
	addMinutesToCurrentTime(minutes: number): Date;
	addSeconds(seconds: number, date: Date): Date;
	addSecondsToCurrentTime(seconds: number): Date;
	compareIfBefore(dateA: Date, dateB: Date): boolean;
	isExpiredDate(date: Date): boolean;
}
