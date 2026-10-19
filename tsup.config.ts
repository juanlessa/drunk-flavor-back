import { defineConfig } from 'tsup';

export default defineConfig({
	format: ['esm'],
	target: 'node22',
	platform: 'node',
	skipNodeModulesBundle: true,
	sourcemap: true,
});
