# TODO / Known Issues

## Schema snapshot mismatch (upgrade-deps)

Context: After upgrading Zod to v4 and modernizing formatting, the JSON
schema generated from the Zod model differs from the existing snapshot for
`spec/pest-model/get-schema.zest.yaml`.

Likely cause: zod-to-json-schema output differences and/or
baldrick-zest-mess expectations with Zod v4.

Repro:

- Run `yarn build`.
- Run `yarn spec` → the “Produce a JSON schema” case fails on `upgrade-deps`.

Decision: Leave failing on `upgrade-deps` until upstream tools are aligned.
Do not update the snapshot yet.

Notes:

- On `main`, the same spec currently passes against the existing snapshot.
- If needed, regenerate snapshot locally from built code.
