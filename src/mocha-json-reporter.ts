import { writeFile } from 'node:fs/promises';
import { getMochaFilename } from './naming.js';
import { FullReport } from './reporter-model.js';
import { PestFileSuiteOpts } from './run-opts-model.js';

const expandReportTracker = (opts: PestFileSuiteOpts): FullReport => {
  const passes = opts.reportTracker.tests.filter(
    (test) => test.err === undefined
  );
  const failures = opts.reportTracker.tests.filter(
    (test) => test.err !== undefined
  );
  const duration = opts.reportTracker.tests.reduce(
    (sum, t) => sum + t.duration,
    0
  );
  return {
    stats: {
      ...opts.reportTracker.stats,
      end: new Date().toISOString(),
      passes: passes.length,
      failures: failures.length,
      duration,
    },
    tests: [...opts.reportTracker.tests],
    passes,
    failures,
    pending: [],
  };
};

export const reportMochaJson = async (opts: PestFileSuiteOpts) => {
  const reportFilename = getMochaFilename(opts.runOpts);
  const fullReport = expandReportTracker(opts);
  await writeFile(reportFilename, JSON.stringify(fullReport, null, 2), {
    encoding: 'utf8',
  });
};
