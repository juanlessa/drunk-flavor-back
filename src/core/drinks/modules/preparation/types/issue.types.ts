import { IssueCodes, IssueSeverities } from '@/core/drinks/modules/preparation/constants/issue.constants';

export type IssueSeverity = (typeof IssueSeverities)[keyof typeof IssueSeverities];
export type IssueCode = (typeof IssueCodes)[keyof typeof IssueCodes];

/** Language-neutral values that a message about the issue may interpolate (ids and enum values, never text). */
export type IssueParams = Readonly<Record<string, string | number>>;
