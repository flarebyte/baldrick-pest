import test from 'node:test';
import assert from 'node:assert/strict';
import YAML from 'yaml';

test('yaml: anchors, aliases, and merge keys', () => {
  const text = [
    'a: &base',
    '  x: 1',
    '  y: 2',
    'b:',
    '  <<: *base',
    '  z: 3',
  ].join('\n');

  const obj = YAML.parse(text) as any;
  assert.equal(obj.b.z, 3);
  assert.deepEqual(obj.b['<<'], { x: 1, y: 2 });
});

test('yaml: folded block scalar preserves content', () => {
  const text = [
    'msg: >',
    '  hello',
    '  world',
  ].join('\n');
  const obj = YAML.parse(text) as any;
  assert.equal(typeof obj.msg, 'string');
  // folded style joins lines with spaces; trailing newline may be present
  assert.ok(obj.msg.includes('hello') && obj.msg.includes('world'));
});

test('yaml: multiple documents parseAllDocuments', () => {
  const text = ['---', 'a: 1', '---', 'b: 2'].join('\n');
  const docs = YAML.parseAllDocuments(text).map((d) => d.toJSON());
  assert.equal(docs.length, 2);
  assert.deepEqual(docs[0], { a: 1 });
  assert.deepEqual(docs[1], { b: 2 });
});
