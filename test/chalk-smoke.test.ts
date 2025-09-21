import assert from 'node:assert/strict';
import test from 'node:test';
import chalk from 'chalk';

void test('chalk: default import has expected API', () => {
  assert.equal(typeof chalk, 'function');
  assert.equal(typeof chalk.bold, 'function');
  assert.equal(typeof chalk.red, 'function');
  assert.equal(typeof chalk.bgGreen, 'function');
  assert.equal(typeof chalk.hex, 'function');
});

void test('chalk: styles string and preserves content', () => {
  const text = 'Hello, Chalk!';
  const styled = chalk.bold.underline.bgGreen(text);
  assert.equal(typeof styled, 'string');
  assert.ok(styled.includes(text));
});
