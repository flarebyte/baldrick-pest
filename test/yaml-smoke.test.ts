import test from 'node:test';
import assert from 'node:assert/strict';
import YAML from 'yaml';

test('yaml: parse simple document', () => {
  const doc = YAML.parse('foo: bar\nn: 3\narr:\n  - a\n  - b\n');
  assert.deepEqual(doc, { foo: 'bar', n: 3, arr: ['a', 'b'] });
});

test('yaml: stringify and parse roundtrip', () => {
  const input = { a: 1, b: 'x', nested: { ok: true } };
  const str = YAML.stringify(input);
  assert.equal(typeof str, 'string');
  const output = YAML.parse(str);
  assert.deepEqual(output, input);
});

