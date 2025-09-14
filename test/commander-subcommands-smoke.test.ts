import test from 'node:test';
import assert from 'node:assert/strict';
import {Command} from 'commander';

void test('commander: subcommand executes with args and options', () => {
	const program = new Command();
	program.name('tool');

	let called = false;
	let receivedName = '';
	let receivedQuiet = false;

	const sub = new Command('do')
		.argument('<name>')
		.option('-q, --quiet', 'suppress output')
		.action((name: string, options: {quiet?: boolean}) => {
			called = true;
			receivedName = name;
			receivedQuiet = Boolean(options.quiet);
		});

	program.addCommand(sub);
	program.exitOverride();

	program.parse(['node', 'tool', 'do', 'task-42', '--quiet']);

	assert.equal(called, true);
	assert.equal(receivedName, 'task-42');
	assert.equal(receivedQuiet, true);

	const subNames = program.commands.map(c => c.name());
	assert.ok(subNames.includes('do'));

	const help = sub.helpInformation();
	assert.equal(typeof help, 'string');
	assert.ok(help.includes('suppress output'));
});
