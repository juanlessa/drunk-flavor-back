# missing

- handle token type on user confirm email and reset password operation, decide between create a compound index for token
  and type or verify in service layer
- add test to ensure is not possible to use wrong token type
- think about how to improve token deletion by user. also if its needed

### smtp

- verify a health check option to don't start the application without smtp configured
- decide mail trap service (ethereal)
- decide production mail service (sendGrid or mailChimp)

### users

- think about how to cleanup not verified users after timeout
- think about user logout, user deletion and also user permission changes reflection (pub/sub queue to revogue access to
  deleted user_id)

### documentation

- improve fastify swagger ui integration

### README.md

- add section about the other scripts like lints and so on
- add section about smtp service and recommend a smtp mail trap

### Next considerations

#### comments feature

- search about query other modeles collections if its a bad practice
- search about use event-driven in same project instance
- add comments module
- the comment should store th user_id and drink_id
- the comment should populate the user
- the comment name should be anonymous if the user is delete
- the drink should trigger an event to delete all drink comment when drink is deleted

### Testing

- adjust providers mailer and storage cover (ignore nom-mocking implementation)
- configure coverage for e2e (infra)
- search how to implement coverage parameter on github workflow
- search if make sense to have coverage on e2e tests

- Add drinks e2e tests to image upload routes, search cloudFlare R2 test limits

#### Multi-layer coverage policy (deferred items)

- E2E coverage remains deferred: no `coverage` block was added to `vitest-e2e.config.ts`. E2E boots the full app plus
  external Mongo/Redis, and its bundled-code line mapping differs from the unit/integration runs, so the setup cost is
  higher and the marginal value is low versus the unit + integration layers, which are the high-value coverage sources.
  Revisit only if an infra path is exercised solely through e2e.
- `src/core/accounts/infra/**` has no integration spec, so it is intentionally kept outside the integration
  `coverage.include` and is currently uncovered by any layer. The fix is future accounts integration specs that exercise
  those repositories/models, not hollow tests and not production changes.
- No coverage thresholds/gates are configured. Reports emit statements/branches/functions/lines (v8 default) without a
  failing gate. A non-gating threshold could later be added via per-suite `coverage.thresholds` in `vitest.config.ts` /
  `vitest-integration.config.ts`, or a CI check reading `coverage/merged/lcov.info`.
- CI follow-up (non-gating): optionally add a coverage-artifact upload step to `unit-tests.yml` /
  `integration-tests.yml` (`actions/upload-artifact` with `continue-on-error: true`), keeping it non-required so it
  never destabilizes the existing test jobs.

---

- (X) bull se não houver env usa as mesmas variaveis do redis
- (X) adicionar instancia do redis ao github
- limpar conteudo do redis entre testes e limpar completamente after all como no mongo
- (X) criar worker

- (X) token hash at db

- paginação não usa X-Total-Count nem Content-Range. poderia usar
- politica de segurança que revoga tokens

### Engagement e2e coverage removed (now mostly restored in the integration layer)

These engagement checks were removed from the e2e suite during an e2e cleanup because they required the real Mongo stack
without needing the HTTP/app layer. They have been reintroduced in the dedicated integration layer (`*.int-spec.ts`, run
by `vitest-integration.config.ts` against real Mongo/Redis via memory-server). Status per concern:

- RESTORED (Mongo model int-specs): index/collection contracts. `rating.model.int-spec.ts` asserts the `ratings`
  collection with exactly [_id_, rating_created_id, rating_drink_created_id, rating_drink_user_unique,
  rating_user_created_id], the unique (drink_id, user_id) index with key { drink_id: 1, user_id: 1 }, and no standalone
  drink_id index. `comment.model.int-spec.ts` asserts the `comments` collection with exactly [_id_,
  comment_drink_status_created_id, comment_status_created_id, comment_user_created_id] and no unique index on any pair.
- RESTORED (Ratings repository int-spec): duplicate-pair behavior against the real unique index — a sequential duplicate
  (drink_id, user_id) is translated to BadRequestError, a concurrent create race resolves to exactly one persisted
  record, and a non-pair duplicate (_id collision) is rethrown rather than masked. The localized 400 at the HTTP layer
  remains covered by createRating.e2e.
- RESTORED (repository int-specs): persistence contracts against real Mongo — comment content and status update
  independently with associations preserved; lean reads omit __v; exact bulk delete counts (deleteByUser/deleteByDrink,
  including zero on repeat) and relation reads (findByUser/findByDrink/findByDrinkAndUser) behave correctly;
  deterministic created_at desc / _id desc tie-breaker across pages.
- RESTORED (Ratings repository int-spec, aggregate sentinel): with sentinel values (avg_rating 3.5, ratings_count 8) on
  a drink, creating/updating/deleting a rating leaves those fields unchanged. The drink is seeded through the raw Mongo
  driver to avoid a cross-core import of the drinks module.
- STILL OUT (HTTP-only, belongs in e2e, not integration): route reachability and auth — all rating/comment routes
  registered without collisions; no arbitrary-user route (/users/:user_id/ratings and /comments absent); public reads
  (GET /ratings, GET /comments) work without a JWT; protected routes (POST /ratings, GET /me/comments, PATCH
  /comments/:id/status) return 401 without a JWT. The per-route comments/ratings e2e specs cover success-path
  reachability + RBAC; the explicit no-collision/absent-route and anonymous-vs-401 matrix is not reintroduced. Decide
  later whether to add it back as focused e2e.

### Engagement e2e to add later

- Add a pagination e2e per resource (ratings and comments) asserting page/limit return the correct subset with
  deterministic ordering (created_at desc, _id desc tie-breaker) end-to-end. Currently ordering/tie-breaker is only
  covered by unit tests.
