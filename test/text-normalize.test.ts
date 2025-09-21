import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeEof } from '../src/text-normalize.js';

void test('normalizeEof: trims trailing blank lines and ensures final newline (LF)', () => {
  const input = 'a\nb\n\n\t \n';
  const actual = normalizeEof(input);
  assert.equal(actual, 'a\nb\n');
});

void test('normalizeEof: converts CRLF to LF and trims', () => {
  const input = 'x\r\ny\r\n\r\n';
  const actual = normalizeEof(input);
  assert.equal(actual, 'x\ny\n');
});
