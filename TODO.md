# TODO / Known Issues

- Schema snapshot mismatch in `spec/pest-model/get-schema.zest.yaml` on the
  `upgrade-deps` branch.

  - Context: After upgrading Zod to v4 and modernizing formatting, the JSON
    schema generated from the Zod model differs from the existing snapshot.

  - Likely cause: zod-to-json-schema output differences and/or
    baldrick-zest-mess config expectations with Zod v4.

  - Repro:
    - `yarn build`
    - `yarn spec` → the “Produce a JSON schema” case fails against the old
      snapshot on `upgrade-deps`.

  - Temporary decision: Leave failing on `upgrade-deps` until
    baldrick-zest-mess and zod schema output are aligned. Do not update the
    snapshot yet.

  - Notes:
    - On `main`, the same spec currently passes against the existing
      snapshot.
    - If needed, regenerate snapshot locally: build then run a script to
      write `spec/snapshots/pest-model/get-schema--schema.json` from the
      built `dist/` code. Avoid committing until the upstream tools are
      confirmed.
