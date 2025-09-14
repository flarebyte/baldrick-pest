import test from 'node:test';
import assert from 'node:assert/strict';
import {Command} from 'commander';

void test('commander: parses flags and options', () => {
	const program = new Command();
	program
		.name('app')
		.version('0.0.0')
		.option('-f, --force', 'force action')
		.option('-c, --count <n>', 'count items', v => Number.parseInt(v, 10), 0);

	program.parse(['node', 'app', '--force', '--count', '3']);
	const options = program.opts();
	assert.equal(options.force, true);
	assert.equal(options.count, 3);

	const help = program.helpInformation();
	assert.equal(typeof help, 'string');
	assert.ok(help.includes('--force'));
});
