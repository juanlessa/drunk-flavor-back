import { type SendMail } from '@/shared/providers/mailer/mailer.dtos';
import { EMAIL_JOB_NAMES } from './emailQueue.constants';

export type EmailJobName = (typeof EMAIL_JOB_NAMES)[keyof typeof EMAIL_JOB_NAMES];

export type SendEmailJobData = SendMail;

export type EmailJobDataMap = {
	[EMAIL_JOB_NAMES.verification]: SendEmailJobData;
	[EMAIL_JOB_NAMES.forgotPassword]: SendEmailJobData;
};

export type EmailJobData = EmailJobDataMap[EmailJobName];
