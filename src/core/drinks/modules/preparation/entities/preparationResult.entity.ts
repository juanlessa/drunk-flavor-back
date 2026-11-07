import { Translations } from '@/core/drinks/types/translations';
import { IssueCode, IssueParams, IssueSeverity } from '@/core/drinks/modules/preparation/types/issue.types';

/** A problem found in a plan. It carries codes and values, never text, so any language can describe it. */
export type PreparationIssue = {
	severity: IssueSeverity;
	code: IssueCode;
	/** Index of the action in the plan; absent for problems of the plan as a whole. */
	actionIndex?: number;
	params?: IssueParams;
};

export type BuildMethodResult =
	| {
			ok: true;
			/** The whole method in each language. */
			method: Translations<string>;
			/** The same method, one sentence per entry. */
			sentences: Translations<string[]>;
			warnings: PreparationIssue[];
	  }
	| { ok: false; errors: PreparationIssue[]; warnings: PreparationIssue[] };
