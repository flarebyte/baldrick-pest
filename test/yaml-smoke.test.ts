import assert from 'node:assert/strict';
import test from 'node:test';
import YAML from 'yaml';

void test('yaml: parse simple document', () => {
  const doc: unknown = YAML.parse('foo: bar\nn: 3\narr:\n  - a\n  - b\n');
  assert.deepEqual(doc, { foo: 'bar', n: 3, arr: ['a', 'b'] });
});

void test('yaml: stringify and parse roundtrip', () => {
  const input = { a: 1, b: 'x', nested: { ok: true } };
  const string_ = YAML.stringify(input);
  assert.equal(typeof string_, 'string');
  const output: unknown = YAML.parse(string_);
  assert.deepEqual(output, input);
});
