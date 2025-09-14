import test from 'node:test';
import assert from 'node:assert/strict';
import {execPath} from 'node:process';
import {execa} from 'execa';

void test('execa: runs node -v successfully', async () => {
	const {exitCode, stdout} = await execa(execPath, ['-v']);
	assert.equal(exitCode, 0);
	assert.ok(typeof stdout === 'string' && stdout.startsWith('v'));
});

void test('execa: rejects on non-zero exit code', async () => {
	await assert.rejects(
		async () => execa(execPath, ['-e', 'process.exit(2)']),
		(error: unknown) => (error as {exitCode?: number})?.exitCode === 2,
	);
});
