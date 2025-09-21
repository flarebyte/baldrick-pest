import { basename, join, relative } from 'node:path';
import type { TestingRunOpts } from './run-opts-model.js';

export const getSnapshotFilename = (
  options: TestingRunOpts,
  useCaseName: string,
  snapshotName: string,
): string => {
  const specFileBase = relative(options.specDir, options.specFile).replace(
    '.pest.yaml',
    '',
  );
  const snapshotFilename = `${specFileBase}--${useCaseName}--${snapshotName}`;
  return join(options.snapshotDir, snapshotFilename);
};

export const getMochaFilename = (options: TestingRunOpts): string => {
  const specFileBase = basename(options.specFile).replace('.pest.yaml', '');
  const reportFilename = `report-${specFileBase}.pest.mocha.json`;
  return join(options.reportDir, reportFilename);
};
