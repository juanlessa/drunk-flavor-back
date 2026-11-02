import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import { userAdministrationReasonValidation, userIdValidation } from './user.schemas';

const firstIssueMessage = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
	result.success ? undefined : result.error?.issues[0]?.message;

describe('User schemas', () => {
	describe('userIdValidation', () => {
		it('accepts a valid ObjectId', () => {
			const id = new ObjectId().toString();

			expect(userIdValidation.parse(id)).toBe(id);
		});

		it.each([
			['missing', undefined, 'apiResponses.users.requiredId'],
			['malformed', 'invalid-id', 'apiResponses.users.invalidIdFormat'],
		])('rejects a %s id', (_case, value, localeKey) => {
			expect(firstIssueMessage(userIdValidation.safeParse(value))).toBe(localeKey);
		});
	});

	describe('userAdministrationReasonValidation', () => {
		it('trims a valid reason', () => {
			expect(userAdministrationReasonValidation.parse('  Security review required this  ')).toBe(
				'Security review required this',
			);
		});

		it.each([
			['missing', undefined, 'apiResponses.users.requiredAdministrationReason'],
			['non-string', 42, 'apiResponses.users.requiredAdministrationReason'],
			['too short after trimming', '   short   ', 'apiResponses.users.invalidAdministrationReasonMin'],
			['too long', 'a'.repeat(501), 'apiResponses.users.invalidAdministrationReasonMax'],
		])('rejects a %s reason', (_case, value, localeKey) => {
			expect(firstIssueMessage(userAdministrationReasonValidation.safeParse(value))).toBe(localeKey);
		});
	});
});
