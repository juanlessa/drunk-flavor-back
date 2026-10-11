# MongoDB E2E Authentication Investigation

## Status

**Verified root cause:** `supercharge/mongodb-github-action@1.12.1` does not create a MongoDB user when
`mongodb-replica-set` is set. The workflow supplied credentials in the application URI anyway, so MongoDB attempted to
authenticate a user that did not exist and returned code 18 (`Authentication failed`).

The environment-parse timing change in commit `592efbc7177362ce8efc6deedec5a31075e580f6` did not address this condition
and was ruled out by the identical subsequent CI failure.

## Evidence

### Action behavior

The tagged [`action.yml`](https://raw.githubusercontent.com/supercharge/mongodb-github-action/1.12.1/action.yml) does
not define `mongodb-key`, which explains the unexpected-input warning. The tagged
[`start-mongodb.sh`](https://raw.githubusercontent.com/supercharge/mongodb-github-action/1.12.1/start-mongodb.sh) has
mutually exclusive initialization paths:

- Without a replica set, it forwards database, username, and password values to the official image initialization
  variables.
- With a replica set, it starts MongoDB with `--replSet`, initializes the set, and checks replica health without
  forwarding the initialization variables or running `db.createUser`.

The tagged
[README authentication caveat](https://raw.githubusercontent.com/supercharge/mongodb-github-action/1.12.1/README.md)
states that replica-set setup and initial user creation cannot be combined through the action and that the user must be
created separately.

The official [`mongo` image documentation](https://hub.docker.com/_/mongo) and
[MongoDB 7 entrypoint](https://raw.githubusercontent.com/docker-library/mongo/master/7.0/docker-entrypoint.sh) establish
that an official-image root user belongs to the `admin` authentication database. Therefore, `authSource=admin` is
correct after an equivalent root user is explicitly created there.

### CI configuration structure

The schema and workflow establish the following without exposing secret values:

```text
MONGO_MODE=external
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DATABASE=non-empty
MONGO_USERNAME=non-empty
MONGO_PASSWORD=non-empty
authSource=admin
replicaSet=rs0
credentials=REDACTED
```

External mode rejects empty credentials before Mongoose is called. The observed MongoDB code 18 therefore came from a
completed server-side authentication attempt. The action and test steps referenced the same secret names; the mismatch
was the action's replica-set behavior, not secret naming or environment timing.

## Local Docker reproduction

A bounded local Docker reproduction used the official `mongo:7.0` image, resolved to MongoDB `7.0.43` on `aarch64`. It
started a single-node `rs0` replica set without initial users, created a synthetic root user in `admin`, constructed an
authenticated URI from percent-encoded synthetic credentials, connected to the application database, and ran `ping`
successfully.

Redacted output:

```text
mongoVersion=v7.0.43
topology=single-node replica set rs0
uri=mongodb://<encoded-username>:<encoded-password>@localhost:27017/e2e-validation?authSource=admin&replicaSet=rs0
authenticatedPing=1
credentials=REDACTED
```

This reproduces the topology, user location, `authSource`, and replica-set parameters used by CI while proving that
explicit post-replica user creation resolves authentication. No real repository secret was used or logged.

An initial diagnostic also found that this `mongosh` version does not expose `assert.commandWorked`. The workflow probe
therefore checks `result.ok` explicitly rather than relying on that shell helper.

## Implemented changes

1. `.github/workflows/e2e-tests.yml`
    - Removed ignored `mongodb-username`, `mongodb-password`, and `mongodb-db` action inputs from the replica-set
      invocation.
    - Removed the unsupported `mongodb-key` input.
    - Added an immediate `Create and verify MongoDB test user` step.
    - The step rejects empty secret-backed values without printing them, passes credentials to the `mongodb` container
      through environment variables, creates an official-image-equivalent root user in `admin`, and validates the same
      encoded URI structure used by the application with an authenticated ping.
    - Diagnostics contain only fixed structural fields and set-state information. Credentials and authenticated URIs are
      never printed.
    - The test step keeps `authSource=admin&replicaSet=rs0`, matching the explicitly created user.

2. `src/infrastructure/mongo/helpers/mongoose.helpers.ts`
    - Percent-encodes username, password, and database path components.
    - Preserves existing query-string semantics for non-empty `MONGO_PARAMS`.
    - Omits the query delimiter when parameters are empty.

3. `src/infrastructure/mongo/helpers/mongoose.helpers.spec.ts`
    - Covers the ordinary URI shape, reserved credential/database characters, and empty parameters with synthetic values
      and isolated environment stubs.

## Rejected hypotheses

- **Dotenv/import timing:** disproved by the failed CI run after commit `592efbc` and by call-time parsing already
  present in the helper.
- **Wrong `authSource` for an action-created application user:** the action created no user in replica-set mode. The
  explicitly created root user correctly belongs to `admin`.
- **Replica-set key as client authentication:** `mongodb-key` is unsupported and ignored by this action version.
- **Different or empty secret names:** both workflow steps use the same names, and empty external-mode values would fail
  schema validation before MongoDB code 18.

Content was rephrased for compliance with licensing restrictions.
