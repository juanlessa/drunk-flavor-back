import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	root: fileURLToPath(new URL('./', import.meta.url)),
	test: {
		coverage: {
			reporter: ['text', 'html', 'lcov', 'json-summary', 'json'],
			reportsDirectory: './coverage/merged',
		},
	},
});
