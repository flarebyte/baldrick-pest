import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import test from 'node:test';
import winston from 'winston';

void test('winston: create logger and log to custom stream', async () => {
  const chunks: string[] = [];
  const sink = new Writable({
    write(chunk: Uint8Array | string, _enc, cb) {
      chunks.push(String(chunk));
      cb();
    },
  });

  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Stream({ stream: sink })],
  });

  assert.equal(typeof logger.info, 'function');
  logger.info('hello', { foo: 'bar' });
  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });

  const output = chunks.join('');
  assert.equal(typeof output, 'string');
  assert.ok(output.includes('"message":"hello"'));
});
