/**
 * Names of the cleanup jobs. Each name states an intent ("what must be cleaned"),
 * not a mechanism, so the module that executes it stays free to change how.
 */
export const CLEANUP_JOB_NAMES = {
	clearCatalogAuthorship: 'account.clear-catalog-authorship',
	deleteComments: 'account.delete-comments',
	deleteStorageFile: 'storage.delete-file',
} as const;
