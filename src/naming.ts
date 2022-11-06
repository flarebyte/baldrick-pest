import { dirname, relative, join, basename } from 'node:path';

const baseConfig = {
    snapshotDir: 'pest-spec/snapshots',
    specDir: 'pest-spec',
    reportDir: 'report',
  };

  export const getSnapshotFilename = (
    specFile: string,
    useCaseName: string,
    snapshotName: string,
  ): string => {
    const specFileBase = relative(baseConfig.specDir, specFile).replace(
      '.pest.yaml',
      ''
    );
    const snapshotFilename = `${specFileBase}--${useCaseName}--${snapshotName}`;
    return join(baseConfig.snapshotDir, snapshotFilename);
  };

  export const getMochaFilename = (specFile: string): string => {
    const specFileBase = basename(specFile).replace('.pest.yaml', '');
    const reportFilename = `report-${specFileBase}.mocha.json`;
    return join(baseConfig.reportDir, reportFilename);
  };