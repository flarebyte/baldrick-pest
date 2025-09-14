import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

test('zod: can import and validate a basic object', () => {
  const schema = z.object({
    id: z.string().uuid(),
    count: z.number().int().nonnegative().default(0),
    tags: z.array(z.string()).optional(),
  });

  const ok = schema.safeParse({
    id: '123e4567-e89b-12d3-a456-426614174000',
  });

  assert.equal(ok.success, true);
  if (ok.success) {
    // default should be applied when missing
    assert.equal(ok.data.count, 0);
    assert.deepEqual(ok.data.tags, undefined);
  }
});

test('zod: invalid object fails validation', () => {
  const schema = z.object({
    id: z.string().uuid(),
    count: z.number().int().nonnegative(),
  });

  const bad = schema.safeParse({ id: 'not-a-uuid', count: -1 });
  assert.equal(bad.success, false);
  if (!bad.success) {
    // ensure issues mention the failing paths
    const paths = bad.error.issues.map((i) => i.path.join('.'));
    assert(paths.includes('id'));
    assert(paths.includes('count'));
  }
});

