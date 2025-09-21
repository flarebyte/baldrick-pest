import process from 'node:process';

// biome-ignore lint/complexity/useLiteralKeys: process.env requires bracket syntax with TS index signatures
export const isCi = Boolean(
  process.env['CI'] ?? process.env['BUILD_NUMBER'] ?? false,
);
