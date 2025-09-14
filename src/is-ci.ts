import process from 'node:process';

export const isCi = Boolean(process.env['CI'] ?? process.env['BUILD_NUMBER'] ?? false);
