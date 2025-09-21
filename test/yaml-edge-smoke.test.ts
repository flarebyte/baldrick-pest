import assert from 'node:assert/strict';
import test from 'node:test';
import YAML from 'yaml';

void test('yaml: anchors, aliases, and merge keys', () => {
  const text = [
    'a: &base',
    '  x: 1',
    '  y: 2',
    'b:',
    '  <<: *base',
    '  z: 3',
  ].join('\n');

  const data: unknown = YAML.parse(text);
  const json = JSON.stringify(data);
  assert.ok(json.includes('"<<"'));
  assert.ok(json.includes('"z":3'));
});

void test('yaml: folded block scalar preserves content', () => {
  const text = ['msg: >', '  hello', '  world'].join('\n');
  const object = YAML.parse(text) as { msg: string };
  assert.equal(typeof object.msg, 'string');
  // Folded style joins lines with spaces; trailing newline may be present
  assert.ok(object.msg.includes('hello') && object.msg.includes('world'));
});

void test('yaml: multiple documents parseAllDocuments', () => {
  const text = ['---', 'a: 1', '---', 'b: 2'].join('\n');
  const docs: unknown[] = YAML.parseAllDocuments(text).map(
    (d) => d.toJSON() as unknown,
  );
  assert.equal(docs.length, 2);
  assert.deepEqual(docs[0], { a: 1 });
  assert.deepEqual(docs[1], { b: 2 });
});
