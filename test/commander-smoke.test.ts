import test from 'node:test';
import assert from 'node:assert/strict';
import { Command } from 'commander';

test('commander: parses flags and options', () => {
  const program = new Command();
  program
    .name('app')
    .version('0.0.0')
    .option('-f, --force', 'force action')
    .option('-c, --count <n>', 'count items', (v) => parseInt(v, 10), 0);

  program.parse(['node', 'app', '--force', '--count', '3']);
  const opts = program.opts();
  assert.equal(opts.force, true);
  assert.equal(opts.count, 3);

  const help = program.helpInformation();
  assert.equal(typeof help, 'string');
  assert.ok(help.includes('--force'));
});

