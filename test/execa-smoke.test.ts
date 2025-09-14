import test from 'node:test';
import assert from 'node:assert/strict';
import { execa } from 'execa';

test('execa: runs node -v successfully', async () => {
  const { exitCode, stdout } = await execa(process.execPath, ['-v']);
  assert.equal(exitCode, 0);
  assert.ok(typeof stdout === 'string' && stdout.startsWith('v'));
});

test('execa: rejects on non-zero exit code', async () => {
  await assert.rejects(
    () => execa(process.execPath, ['-e', 'process.exit(2)']),
    (err: any) => err && typeof err.exitCode === 'number' && err.exitCode === 2,
  );
});

