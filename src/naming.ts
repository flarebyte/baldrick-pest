import { relative, join, basename } from 'node:path';
import { TestingRunOpts } from './run-opts-model.js';

const baseConfig = {
  snapshotDir: 'pest-spec/snapshots',
  specDir: 'pest-spec',
  reportDir: 'report',
};

export const getSnapshotFilename = (
  opts: TestingRunOpts,
  useCaseName: string,
  snapshotName: string
): string => {
  const specFileBase = relative(baseConfig.specDir, opts.specFile).replace(
    '.pest.yaml',
    ''
  );
  const snapshotFilename = `${specFileBase}--${useCaseName}--${snapshotName}`;
  return join(baseConfig.snapshotDir, snapshotFilename);
};

export const getMochaFilename = (opts: TestingRunOpts): string => {
  const specFileBase = basename(opts.specFile).replace('.pest.yaml', '');
  const reportFilename = `report-${specFileBase}.mocha.json`;
  return join(baseConfig.reportDir, reportFilename);
};
