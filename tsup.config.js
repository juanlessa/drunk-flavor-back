// @ts-check

import { defineConfig } from 'tsup';

/**
 * Keep runtime dependencies external instead of bundling them into the output.
 *
 * The deploy artifact ships `node_modules` alongside `dist`, so inlining
 * third-party code is unnecessary. Bundling packages such as `@redis/client`
 * (pulled in transitively through `redis` and `bullmq`) breaks at runtime:
 * they call `require('crypto')` internally, and in an ESM bundle that becomes
 * an unsupported dynamic require ("Dynamic require of \"crypto\" is not
 * supported").
 *
 * `skipNodeModulesBundle` externalizes every `node_modules` import, including
 * transitive scoped subpaths that the default `dependencies`-only exclusion
 * still bundles. Node's own loader then resolves those packages at runtime.
 * Only first-party code (the `@/` path alias) is bundled.
 *
 * This file is authored as `.js` with a JSDoc type annotation (same pattern as
 * `eslint.config.js`) so it stays out of the project's `tsc --noEmit` scope.
 * tsup's shipped `index.d.ts` references an internal `./types.cts` that the
 * package does not ship, which breaks a strict `tsc` run with
 * `skipLibCheck: false`. Keeping the config as JS preserves editor IntelliSense
 * without dragging that broken declaration into the type check.
 */
export default defineConfig({
	format: ['esm'],
	target: 'node22',
	platform: 'node',
	skipNodeModulesBundle: true,
	sourcemap: true,
});
