import test from 'node:test';
import assert from 'node:assert/strict';
import {diff} from 'jest-diff';

void test('jest-diff: returns string for differences', () => {
	const output = diff({a: 1}, {a: 2});
	assert.equal(typeof output, 'string');
	assert.ok(output && output.length > 0);
});

void test('jest-diff: identical values produce no meaningful diff', () => {
	const output = diff({x: [1, 2]}, {x: [1, 2]});
	assert.ok(output === null || /no visual difference/i.test(String(output)));
});
