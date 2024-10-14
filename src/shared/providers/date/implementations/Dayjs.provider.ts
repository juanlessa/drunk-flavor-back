import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { IDateProvider } from '../IDateProvider';

dayjs.extend(utc);

export class DayjsProvider implements IDateProvider {
	compareInHours(start_date: Date, end_date: Date): number {
		const end_date_utc = this.convertToUTC(end_date);
		const start_date_utc = this.convertToUTC(start_date);

		return dayjs(end_date_utc).diff(start_date_utc, 'hours');
	}

	compareInDays(start_date: Date, end_date: Date): number {
		const end_date_utc = this.convertToUTC(end_date);
		const start_date_utc = this.convertToUTC(start_date);

		return dayjs(end_date_utc).diff(start_date_utc, 'days');
	}

	convertToUTC(date: Date): string {
		return dayjs(date).utc().local().format();
	}

	dateNow(): Date {
		return dayjs().toDate();
	}

	addDays(days: number, date: Date): Date {
		return dayjs(date).add(days, 'day').toDate();
	}

	addDaysToCurrentTime(days: number): Date {
		return dayjs().add(days, 'day').toDate();
	}

	addHours(hours: number, date: Date): Date {
		return dayjs(date).add(hours, 'hour').toDate();
	}

	addHoursToCurrentTime(hours: number): Date {
		return dayjs().add(hours, 'hour').toDate();
	}

	addMinutes(minutes: number, date: Date): Date {
		return dayjs(date).add(minutes, 'minute').toDate();
	}

	addMinutesToCurrentTime(minutes: number): Date {
		return dayjs().add(minutes, 'minute').toDate();
	}

	addSeconds(seconds: number, date: Date): Date {
		return dayjs(date).add(seconds, 'second').toDate();
	}

	addSecondsToCurrentTime(seconds: number): Date {
		return dayjs().add(seconds, 'second').toDate();
	}

	compareIfBefore(dateA: Date, dateB: Date): boolean {
		return dayjs(dateA).isBefore(dateB);
	}

	isExpiredDate(date: Date): boolean {
		return dayjs(date).isBefore(this.dateNow());
	}
}
