import { relative, join, basename } from 'node:path';
import { TestingRunOpts } from './run-opts-model.js';

export const getSnapshotFilename = (
  opts: TestingRunOpts,
  useCaseName: string,
  snapshotName: string
): string => {
  const specFileBase = relative(opts.specDir, opts.specFile).replace(
    '.pest.yaml',
    ''
  );
  const snapshotFilename = `${specFileBase}--${useCaseName}--${snapshotName}`;
  return join(opts.snapshotDir, snapshotFilename);
};

export const getMochaFilename = (opts: TestingRunOpts): string => {
  const specFileBase = basename(opts.specFile).replace('.pest.yaml', '');
  const reportFilename = `report-${specFileBase}.mocha.json`;
  return join(opts.reportDir, reportFilename);
};
